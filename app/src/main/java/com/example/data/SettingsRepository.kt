package com.example.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

class SettingsRepository(private val context: Context) {
    private val SIDEBAR_VISIBLE = booleanPreferencesKey("sidebar_visible")

    val isSidebarVisible: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[SIDEBAR_VISIBLE] ?: true // Default to visible
    }

    suspend fun setSidebarVisible(isVisible: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[SIDEBAR_VISIBLE] = isVisible
        }
    }
}
