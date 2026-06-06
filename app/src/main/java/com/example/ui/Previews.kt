@file:Suppress("PreviewAnnotationInFunctionWithParameters")

package com.example.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.tooling.preview.Devices
import androidx.compose.ui.unit.dp
import androidx.navigation.compose.rememberNavController
import com.example.ui.theme.MyApplicationTheme

// ────────────────────────────────────────────────────────────────────────────
// TopBar
// ────────────────────────────────────────────────────────────────────────────

@Preview(name = "TopBar – Sidebar Visible", showBackground = true, widthDp = 420)
@Composable
private fun TopBarVisiblePreview() {
    MyApplicationTheme {
        TopBar(isSidebarVisible = true, onToggleSidebar = {})
    }
}

@Preview(name = "TopBar – Sidebar Hidden", showBackground = true, widthDp = 420)
@Composable
private fun TopBarHiddenPreview() {
    MyApplicationTheme {
        TopBar(isSidebarVisible = false, onToggleSidebar = {})
    }
}

// ────────────────────────────────────────────────────────────────────────────
// ResponsiveSidebarContent
// ────────────────────────────────────────────────────────────────────────────

@Preview(name = "Sidebar – Expanded / Search selected", showBackground = true, widthDp = 280, heightDp = 600)
@Composable
private fun SidebarExpandedSearchPreview() {
    MyApplicationTheme {
        Box(modifier = Modifier.background(MaterialTheme.colorScheme.surfaceVariant)) {
            ResponsiveSidebarContent(
                isExpanded = true,
                selectedAgent = GrantAgent.SEARCH,
                onAgentSelected = {}
            )
        }
    }
}

@Preview(name = "Sidebar – Expanded / Evaluation selected", showBackground = true, widthDp = 280, heightDp = 600)
@Composable
private fun SidebarExpandedEvalPreview() {
    MyApplicationTheme {
        Box(modifier = Modifier.background(MaterialTheme.colorScheme.surfaceVariant)) {
            ResponsiveSidebarContent(
                isExpanded = true,
                selectedAgent = GrantAgent.EVALUATION,
                onAgentSelected = {}
            )
        }
    }
}

@Preview(name = "Sidebar – Expanded / Settings selected", showBackground = true, widthDp = 280, heightDp = 600)
@Composable
private fun SidebarExpandedSettingsPreview() {
    MyApplicationTheme {
        Box(modifier = Modifier.background(MaterialTheme.colorScheme.surfaceVariant)) {
            ResponsiveSidebarContent(
                isExpanded = true,
                selectedAgent = GrantAgent.SETTINGS,
                onAgentSelected = {}
            )
        }
    }
}

@Preview(name = "Sidebar – Collapsed (icons only)", showBackground = true, widthDp = 80, heightDp = 600)
@Composable
private fun SidebarCollapsedPreview() {
    MyApplicationTheme {
        Box(modifier = Modifier.background(MaterialTheme.colorScheme.surfaceVariant)) {
            ResponsiveSidebarContent(
                isExpanded = false,
                selectedAgent = GrantAgent.COPYWRITER,
                onAgentSelected = {}
            )
        }
    }
}

// ────────────────────────────────────────────────────────────────────────────
// SearchScreen
// ────────────────────────────────────────────────────────────────────────────

@Preview(name = "Search Screen – Phone", showBackground = true, device = Devices.PHONE)
@Composable
private fun SearchScreenPreview() {
    MyApplicationTheme {
        SearchScreen(navController = rememberNavController())
    }
}

// ────────────────────────────────────────────────────────────────────────────
// EvaluationScreen
// ────────────────────────────────────────────────────────────────────────────

@Preview(name = "Evaluation Screen – No grant selected", showBackground = true, device = Devices.PHONE)
@Composable
private fun EvaluationNoGrantPreview() {
    MyApplicationTheme {
        EvaluationScreen(viewModel = EvaluationViewModel(), grantId = null)
    }
}

@Preview(name = "Evaluation Screen – Grant pre-loaded", showBackground = true, device = Devices.PHONE)
@Composable
private fun EvaluationWithGrantPreview() {
    MyApplicationTheme {
        EvaluationScreen(viewModel = EvaluationViewModel(), grantId = "horizon-eu-ai-2026")
    }
}

// ────────────────────────────────────────────────────────────────────────────
// CopywriterScreen
// ────────────────────────────────────────────────────────────────────────────

@Preview(name = "Copywriter Screen – Phone", showBackground = true, device = Devices.PHONE)
@Composable
private fun CopywriterScreenPreview() {
    MyApplicationTheme {
        CopywriterScreen(viewModel = CopywriterViewModel())
    }
}

// ────────────────────────────────────────────────────────────────────────────
// AdminScreen
// ────────────────────────────────────────────────────────────────────────────

@Preview(name = "Admin Screen – Phone", showBackground = true, device = Devices.PHONE)
@Composable
private fun AdminScreenPreview() {
    MyApplicationTheme {
        AdminScreen(viewModel = AdminViewModel())
    }
}

// ────────────────────────────────────────────────────────────────────────────
// SettingsScreen
// ────────────────────────────────────────────────────────────────────────────

@Preview(name = "Settings Screen – Phone", showBackground = true, device = Devices.PHONE)
@Composable
private fun SettingsScreenPreview() {
    MyApplicationTheme {
        SettingsScreen()
    }
}

// ────────────────────────────────────────────────────────────────────────────
// Full App Layout (Static – no ViewModel needed)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Simulates the compact (phone) layout: top bar stacked above the workspace.
 * The navigation drawer would overlay on tap; here the workspace is shown directly.
 */
@Preview(name = "Full App – Phone (Compact)", showBackground = true, device = Devices.PHONE)
@Composable
private fun FullAppPhonePreview() {
    MyApplicationTheme {
        Column(modifier = Modifier.fillMaxSize()) {
            TopBar(isSidebarVisible = false, onToggleSidebar = {})
            SearchScreen(navController = rememberNavController())
        }
    }
}

/**
 * Simulates the expanded (tablet/desktop) layout: persistent expanded sidebar
 * beside the workspace content.
 */
@Preview(name = "Full App – Tablet (Expanded sidebar)", showBackground = true, device = Devices.TABLET)
@Composable
private fun FullAppTabletExpandedPreview() {
    MyApplicationTheme {
        Column(modifier = Modifier.fillMaxSize()) {
            TopBar(isSidebarVisible = true, onToggleSidebar = {})
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            ) {
                // Persistent expanded sidebar
                Box(
                    modifier = Modifier
                        .width(280.dp)
                        .fillMaxHeight()
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    ResponsiveSidebarContent(
                        isExpanded = true,
                        selectedAgent = GrantAgent.SEARCH,
                        onAgentSelected = {}
                    )
                }
                // Main workspace area
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .background(MaterialTheme.colorScheme.surface)
                ) {
                    SearchScreen(navController = rememberNavController())
                }
            }
        }
    }
}

/**
 * Simulates the medium (tablet) layout: collapsed icon-only sidebar beside the workspace.
 */
@Preview(name = "Full App – Tablet (Collapsed sidebar)", showBackground = true, device = Devices.TABLET)
@Composable
private fun FullAppTabletCollapsedPreview() {
    MyApplicationTheme {
        Column(modifier = Modifier.fillMaxSize()) {
            TopBar(isSidebarVisible = false, onToggleSidebar = {})
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            ) {
                // Collapsed icon-only sidebar
                Box(
                    modifier = Modifier
                        .width(80.dp)
                        .fillMaxHeight()
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    ResponsiveSidebarContent(
                        isExpanded = false,
                        selectedAgent = GrantAgent.SEARCH,
                        onAgentSelected = {}
                    )
                }
                // Main workspace area
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .background(MaterialTheme.colorScheme.surface)
                ) {
                    SearchScreen(navController = rememberNavController())
                }
            }
        }
    }
}

/**
 * Evaluation workspace in the tablet expanded layout.
 */
@Preview(name = "Full App – Tablet / Evaluation", showBackground = true, device = Devices.TABLET)
@Composable
private fun FullAppTabletEvaluationPreview() {
    MyApplicationTheme {
        Column(modifier = Modifier.fillMaxSize()) {
            TopBar(isSidebarVisible = true, onToggleSidebar = {})
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .width(280.dp)
                        .fillMaxHeight()
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    ResponsiveSidebarContent(
                        isExpanded = true,
                        selectedAgent = GrantAgent.EVALUATION,
                        onAgentSelected = {}
                    )
                }
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .background(MaterialTheme.colorScheme.surface)
                ) {
                    EvaluationScreen(viewModel = EvaluationViewModel(), grantId = "digital-europe-cloud-2")
                }
            }
        }
    }
}

/**
 * Settings screen in the tablet expanded layout.
 */
@Preview(name = "Full App – Tablet / Settings", showBackground = true, device = Devices.TABLET)
@Composable
private fun FullAppTabletSettingsPreview() {
    MyApplicationTheme {
        Column(modifier = Modifier.fillMaxSize()) {
            TopBar(isSidebarVisible = true, onToggleSidebar = {})
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .width(280.dp)
                        .fillMaxHeight()
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    ResponsiveSidebarContent(
                        isExpanded = true,
                        selectedAgent = GrantAgent.SETTINGS,
                        onAgentSelected = {}
                    )
                }
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .background(MaterialTheme.colorScheme.surface)
                ) {
                    SettingsScreen()
                }
            }
        }
    }
}
