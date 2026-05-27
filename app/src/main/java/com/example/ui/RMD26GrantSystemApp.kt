package com.example.ui

import androidx.compose.runtime.Composable
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument

@Composable
fun RMD26GrantSystemApp() {
    val navController = rememberNavController()

    // Wrap this in your Navigation Drawer/Rail Layout
    NavHost(navController = navController, startDestination = "search") {
        composable("search") { SearchScreen(navController = navController) }
        composable(
            route = "evaluation?grantId={grantId}",
            arguments = listOf(
                navArgument("grantId") {
                    type = NavType.StringType
                    nullable = true
                    defaultValue = null
                }
            )
        ) { backStackEntry ->
            val grantId = backStackEntry.arguments?.getString("grantId")
            EvaluationScreen(viewModel = viewModel(), grantId = grantId)
        }
        composable("copywriter") { CopywriterScreen(viewModel = viewModel()) }
        composable("administration") { AdminScreen(viewModel = viewModel()) }
        composable("settings") { SettingsScreen() }
    }
}
