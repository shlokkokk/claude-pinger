package com.example.claudepulse.core

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class AccountPingStatus(val username: String, val success: Boolean, val detail: String)
data class PingResult(val success: Boolean, val message: String, val statuses: List<AccountPingStatus> = emptyList())
data class HealthResult(val healthy: Boolean, val latencyMs: Long, val details: String)

object CloudflareApiService {

    private const val BASE_URL = "https://claude-pinger.claude-pinger.workers.dev"

    suspend fun checkHealth(): HealthResult = withContext(Dispatchers.IO) {
        val start = System.currentTimeMillis()
        try {
            val url = URL("$BASE_URL/api/health")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = 8000
                readTimeout = 8000
            }

            val code = conn.responseCode
            val latency = System.currentTimeMillis() - start

            if (code == 200) {
                val response = conn.inputStream.bufferedReader().use { it.readText() }
                val json = JSONObject(response)
                val status = json.optString("status", "unknown")
                val browserlessStatus = json.optJSONObject("browserless")?.optString("status", "unknown") ?: "unknown"
                val region = json.optJSONObject("worker")?.optString("region", "Edge") ?: "Edge"
                HealthResult(
                    healthy = status == "healthy",
                    latencyMs = latency,
                    details = "Worker: $region | Browserless: $browserlessStatus"
                )
            } else {
                HealthResult(false, latency, "HTTP error: $code")
            }
        } catch (e: Exception) {
            HealthResult(false, System.currentTimeMillis() - start, e.message ?: "Connection error")
        }
    }

    suspend fun triggerPing(accountNum: Int? = null): PingResult = withContext(Dispatchers.IO) {
        try {
            val endpoint = if (accountNum == null) "$BASE_URL/api/ping" else "$BASE_URL/api/ping?account=$accountNum"
            val url = URL(endpoint)
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 25000
                readTimeout = 25000
                doOutput = true
            }

            val code = conn.responseCode
            val stream = if (code in 200..299) conn.inputStream else conn.errorStream
            val response = stream?.bufferedReader()?.use { it.readText() } ?: ""

            if (code in 200..299) {
                val json = JSONObject(response)
                val resultsArray = json.optJSONArray("results")
                val statuses = mutableListOf<AccountPingStatus>()

                if (resultsArray != null && resultsArray.length() > 0) {
                    for (i in 0 until resultsArray.length()) {
                        val item = resultsArray.optJSONObject(i) ?: continue
                        val accId = item.optInt("account", if (accountNum != null) accountNum else (i + 1))
                        val username = if (accId == 1) "shlokshah412" else "pcgpt"
                        
                        val resultObj = item.optJSONObject("result") ?: item.optJSONObject("value")
                        val isFulfilled = item.optString("status") != "rejected"
                        val isSuccess = isFulfilled && (resultObj?.optBoolean("success", true) ?: true)
                        val errorDetail = resultObj?.optString("error") ?: item.optString("reason", "Ping failed")

                        statuses.add(
                            AccountPingStatus(
                                username = username,
                                success = isSuccess,
                                detail = if (isSuccess) "Ping sent" else errorDetail
                            )
                        )
                    }
                } else {
                    val defaultName = if (accountNum == 1) "shlokshah412" else if (accountNum == 2) "pcgpt" else "Both"
                    statuses.add(AccountPingStatus(defaultName, true, "Ping sent"))
                }

                val allSuccessful = statuses.all { it.success }
                PingResult(allSuccessful, if (allSuccessful) "Ping sent" else "One or more pings failed", statuses)
            } else {
                PingResult(false, "Server returned HTTP $code")
            }
        } catch (e: Exception) {
            PingResult(false, e.message ?: "Network error")
        }
    }
}
