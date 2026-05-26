package com.example.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier

class SearchViewModel : androidx.lifecycle.ViewModel()
class EvaluationViewModel : androidx.lifecycle.ViewModel()
class CopywriterViewModel : androidx.lifecycle.ViewModel()
class AdminViewModel : androidx.lifecycle.ViewModel()

@Composable
fun SearchScreen(viewModel: SearchViewModel) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("Search Workspace", style = MaterialTheme.typography.bodyLarge)
    }
}

@Composable
fun EvaluationScreen(viewModel: EvaluationViewModel) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("Evaluation Workspace", style = MaterialTheme.typography.bodyLarge)
    }
}

@Composable
fun CopywriterScreen(viewModel: CopywriterViewModel) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("Proposal Copywriter Workspace", style = MaterialTheme.typography.bodyLarge)
    }
}

@Composable
fun AdminScreen(viewModel: AdminViewModel) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("Administration Workspace", style = MaterialTheme.typography.bodyLarge)
    }
}

@Composable
fun SettingsScreen() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("Settings Workspace", style = MaterialTheme.typography.bodyLarge)
    }
}
