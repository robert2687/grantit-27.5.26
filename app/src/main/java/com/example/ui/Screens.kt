package com.example.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Checkbox
import androidx.compose.material3.Divider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import java.text.NumberFormat
import java.util.Locale

class EvaluationViewModel : androidx.lifecycle.ViewModel()
class CopywriterViewModel : androidx.lifecycle.ViewModel()
class AdminViewModel : androidx.lifecycle.ViewModel()

private const val EVALUATION_ROUTE = "evaluation"

private fun evaluationRoute(grantId: String? = null): String {
    return if (grantId.isNullOrBlank()) {
        EVALUATION_ROUTE
    } else {
        "$EVALUATION_ROUTE?grantId=$grantId"
    }
}

@Composable
fun SearchScreen(
    navController: NavController,
    viewModel: SearchViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val currencyFormatter = remember { NumberFormat.getCurrencyInstance(Locale.GERMANY) }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Global Grant Scanner", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = uiState.keyword,
            onValueChange = viewModel::onKeywordChange,
            label = { Text("Keyword") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = uiState.minAmount,
            onValueChange = viewModel::onMinAmountChange,
            label = { Text("Minimum funding (EUR)") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))
        Button(onClick = viewModel::search) {
            Text("Search Grants")
        }
        Spacer(modifier = Modifier.height(12.dp))

        if (uiState.isLoading) {
            CircularProgressIndicator()
            Spacer(modifier = Modifier.height(12.dp))
        }

        uiState.errorMessage?.let { message ->
            Text(
                text = "Grant Search Agent error: $message",
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(bottom = 8.dp)
            )
        }

        if (!uiState.isLoading && uiState.results.isEmpty()) {
            Text(
                text = "No grants found. Try another keyword or lower minimum amount.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(bottom = 8.dp)
            )
        }

        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(uiState.results) { grant ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { navController.navigate(evaluationRoute(grant.id)) },
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(grant.name, fontWeight = FontWeight.Bold)
                        Text(
                            "Funding: ${currencyFormatter.format(grant.amountEur)} | " +
                                "Deadline: ${grant.deadlineIsoDate} | Region: ${grant.region}"
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(onClick = { navController.navigate(evaluationRoute(grant.id)) }) {
                            Text("Send to Evaluation Agent")
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun EvaluationScreen(viewModel: EvaluationViewModel, grantId: String?) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text("Evaluation Workspace", style = MaterialTheme.typography.headlineMedium)
        Text(
            text = if (grantId.isNullOrBlank()) {
                "No grant selected."
            } else {
                "Selected Grant ID: $grantId"
            },
            style = MaterialTheme.typography.bodyLarge
        )
    }
}

@Composable
fun CopywriterScreen(viewModel: CopywriterViewModel) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("Proposal Copywriter Workspace", style = MaterialTheme.typography.bodyLarge)
    }
}

@Composable
fun CopywriterScreen() {
    CopywriterScreen(viewModel = viewModel())
}

@Composable
fun AdminScreen(viewModel: AdminViewModel) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("Administration Workspace", style = MaterialTheme.typography.bodyLarge)
    }
}

@Composable
fun AdminScreen() {
    AdminScreen(viewModel = viewModel())
}

@Composable
fun SettingsScreen() {
    var pushNotifications by remember { mutableStateOf(true) }
    var apiKey by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("System Settings", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(24.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Deadline Push Notifications", style = MaterialTheme.typography.titleMedium)
            Switch(checked = pushNotifications, onCheckedChange = { pushNotifications = it })
        }

        Spacer(modifier = Modifier.height(24.dp))
        Divider()
        Spacer(modifier = Modifier.height(24.dp))

        Text("Agent API Configuration", style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = apiKey,
            onValueChange = { apiKey = it },
            label = { Text("Cloud Agent API Key") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = { /* Save to DataStore */ }) {
            Text("Save Settings")
        }
    }
}
