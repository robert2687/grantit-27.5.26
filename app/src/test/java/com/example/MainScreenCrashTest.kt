package com.example

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import com.example.ui.MainScreen
import com.example.ui.MainViewModel
import com.example.data.SettingsRepository
import androidx.test.core.app.ApplicationProvider
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick

@RunWith(AndroidJUnit4::class)
class MainScreenCrashTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun testRendering() {
        val repository = SettingsRepository(ApplicationProvider.getApplicationContext())
        val viewModel = MainViewModel(repository)
        composeTestRule.setContent {
            Surface(modifier = Modifier.fillMaxSize()) {
                MainScreen(viewModel = viewModel)
            }
        }
        
        composeTestRule.waitForIdle()

        composeTestRule.onNodeWithText("Evaluation").performClick()
        composeTestRule.waitForIdle()
        
        composeTestRule.onNodeWithText("Evaluation Workspace").assertExists()
    }
}
