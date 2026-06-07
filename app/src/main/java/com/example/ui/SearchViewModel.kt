package com.example.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.GrantSearchAgentRepository
import com.example.data.GrantSearchResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class SearchViewModel(
    private val repository: GrantSearchAgentRepository = GrantSearchAgentRepository.createDefault()
) : ViewModel() {

    private val _uiState = MutableStateFlow(SearchUiState())
    val uiState: StateFlow<SearchUiState> = _uiState.asStateFlow()

    init {
        search()
    }

    fun onKeywordChange(keyword: String) {
        _uiState.update { it.copy(keyword = keyword) }
    }

    fun onMinAmountChange(minAmount: String) {
        _uiState.update { it.copy(minAmount = minAmount) }
    }

    fun search() {
        val keyword = _uiState.value.keyword.trim()
        val minAmount = _uiState.value.minAmount.trim().toDoubleOrNull()

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            runCatching {
                repository.searchGrants(keyword = keyword, minAmountEur = minAmount)
            }.onSuccess { results ->
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        results = results,
                        errorMessage = null
                    )
                }
            }.onFailure { throwable ->
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage = throwable.message ?: "Failed to load grants from Grant Search Agent"
                    )
                }
            }
        }
    }
}

data class SearchUiState(
    val keyword: String = "",
    val minAmount: String = "",
    val isLoading: Boolean = false,
    val results: List<GrantSearchResult> = emptyList(),
    val errorMessage: String? = null
)
