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
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
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
import androidx.navigation.NavController

class SearchViewModel : androidx.lifecycle.ViewModel()
class EvaluationViewModel : androidx.lifecycle.ViewModel()
class CopywriterViewModel : androidx.lifecycle.ViewModel()
class AdminViewModel : androidx.lifecycle.ViewModel()

data class Grant(val id: String, val name: String, val amount: String, val deadline: String)

private const val EVALUATION_ROUTE = "evaluation"

private fun evaluationRoute(grantId: String? = null): String {
    return if (grantId.isNullOrBlank()) {
        EVALUATION_ROUTE
    } else {
        "$EVALUATION_ROUTE?grantId=$grantId"
    }
}

@Composable
fun SearchScreen(navController: NavController) {
    // Mock data - replace with your Agent's API response
    val grants = listOf(
        Grant("1", "Horizon Europe: AI Innovation", "€2,500,000", "Oct 15, 2026"),
        Grant("2", "Digital Europe: Cloud Infrastructure", "€1,200,000", "Nov 01, 2026")
    )

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Global Grant Scanner", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(grants) { grant ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { navController.navigate(evaluationRoute(grant.id)) },
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(grant.name, fontWeight = FontWeight.Bold)
                        Text("Funding: ${grant.amount} | Deadline: ${grant.deadline}")
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
fun CopywriterScreen() {
    var generatedText by remember { mutableStateOf("") }
    var isGenerating by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Proposal Generator Agent", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Button(
                onClick = {
                    isGenerating = true
                    // TODO: Trigger your LLM/Agentic Swarm API here
                    generatedText = "Executive Summary:\n\nRMD26 proposes a novel multi-agent architecture..."
                    isGenerating = false
                },
                enabled = !isGenerating
            ) {
                Text(if (isGenerating) "Generating..." else "Draft Proposal")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = generatedText,
            onValueChange = { generatedText = it },
            modifier = Modifier.fillMaxSize(),
            label = { Text("Draft Output") },
            placeholder = { Text("AI generated proposal will appear here...") }
        )
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
