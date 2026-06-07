package com.example.data

import com.example.BuildConfig
import com.squareup.moshi.JsonClass
import retrofit2.http.GET
import retrofit2.http.Query
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory

interface GrantSearchAgentRepository {
    suspend fun searchGrants(keyword: String, minAmountEur: Double? = null): List<GrantSearchResult>

    companion object {
        fun createDefault(): GrantSearchAgentRepository {
            val api = Retrofit.Builder()
                .baseUrl(BuildConfig.GRANT_SEARCH_AGENT_BASE_URL)
                .addConverterFactory(MoshiConverterFactory.create())
                .build()
                .create(GrantSearchAgentApi::class.java)

            return NetworkGrantSearchAgentRepository(api)
        }
    }
}

private interface GrantSearchAgentApi {
    @GET("api/agents/grant-search")
    suspend fun searchGrants(
        @Query("keyword") keyword: String,
        @Query("minAmountEur") minAmountEur: Double? = null
    ): List<GrantSearchResult>
}

private class NetworkGrantSearchAgentRepository(
    private val api: GrantSearchAgentApi
) : GrantSearchAgentRepository {

    override suspend fun searchGrants(keyword: String, minAmountEur: Double?): List<GrantSearchResult> {
        return api.searchGrants(keyword = keyword, minAmountEur = minAmountEur)
    }
}

@JsonClass(generateAdapter = true)
data class GrantSearchResult(
    val id: String,
    val name: String,
    val amountEur: Double,
    val deadlineIsoDate: String,
    val region: String
)
