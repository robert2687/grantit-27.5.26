package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.lifecycle.ViewModelProvider
import com.example.data.SettingsRepository
import com.example.ui.MainScreen
import com.example.ui.MainViewModel
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    
    val repository = SettingsRepository(applicationContext)
    val viewModelFactory = MainViewModel.Factory(repository)
    val mainViewModel = ViewModelProvider(this, viewModelFactory)[MainViewModel::class.java]

    setContent {
      MyApplicationTheme {
        Surface(modifier = Modifier.fillMaxSize()) {
            MainScreen(viewModel = mainViewModel)
        }
      }
    }
  }
}
