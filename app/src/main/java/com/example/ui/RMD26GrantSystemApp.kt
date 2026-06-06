package com.example.ui

import androidx.compose.runtime.Composable
import androidx.navigation.compose.rememberNavController

@Composable
fun RMD26GrantSystemApp() {
    val navController = rememberNavController()
    GrantSystemNavHost(navController = navController)
}
