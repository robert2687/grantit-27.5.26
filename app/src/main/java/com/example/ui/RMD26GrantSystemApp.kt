package com.example.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.SettingsRepository

@Composable
fun RMD26GrantSystemApp() {
    val context = LocalContext.current
    val repository = remember(context) { SettingsRepository(context.applicationContext) }
    val mainViewModel: MainViewModel = viewModel(
        factory = MainViewModel.Factory(repository)
    )

    MainScreen(viewModel = mainViewModel)
}
