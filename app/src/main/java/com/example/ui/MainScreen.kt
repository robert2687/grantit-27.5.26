package com.example.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.expandHorizontally
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkHorizontally
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.Create
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.RateReview
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle

enum class WindowSize {
    COMPACT, MEDIUM, EXPANDED
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(viewModel: MainViewModel) {
    val persistedSidebarVisible by viewModel.isSidebarVisible.collectAsStateWithLifecycle()
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    val selectedAgent = GrantAgent.entries.find { it.route == currentRoute } ?: GrantAgent.SEARCH

    var isInitialDataLoaded by remember { mutableStateOf(false) }
    var localSidebarVisible by remember { mutableStateOf(true) }

    LaunchedEffect(persistedSidebarVisible) {
        if (!isInitialDataLoaded) {
            localSidebarVisible = persistedSidebarVisible
            isInitialDataLoaded = true
        }
    }

    val haptic = LocalHapticFeedback.current

    val onVisibilityChange: (Boolean) -> Unit = { isVisible ->
        if (localSidebarVisible != isVisible) {
            localSidebarVisible = isVisible
            viewModel.setSidebarVisible(isVisible)
        }
    }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        contentColor = MaterialTheme.colorScheme.onBackground
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Main Top Bar (Always visible securely above workspace/drawer)
            TopBar(
                isSidebarVisible = localSidebarVisible,
                onToggleSidebar = { onVisibilityChange(!localSidebarVisible) }
            )

            BoxWithConstraints(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            ) {
                val windowSize = when {
                    maxWidth < 600.dp -> WindowSize.COMPACT
                    maxWidth < 840.dp -> WindowSize.MEDIUM
                    else -> WindowSize.EXPANDED
                }
                
                val isCompact = windowSize == WindowSize.COMPACT

                // Mobile: Swipeable Modal Navigation Drawer
                val drawerState = rememberDrawerState(
                    initialValue = if (localSidebarVisible && isCompact) DrawerValue.Open else DrawerValue.Closed
                )

                // Sync UI -> Drawer (only for compact)
                LaunchedEffect(localSidebarVisible, isCompact) {
                    if (isCompact) {
                        if (localSidebarVisible && drawerState.isClosed) {
                            drawerState.open()
                        } else if (!localSidebarVisible && drawerState.isOpen) {
                            drawerState.close()
                        }
                    }
                }

                // Sync Drawer -> UI (only for compact)
                LaunchedEffect(drawerState.currentValue, isCompact) {
                    if (isCompact) {
                        val isOpen = drawerState.currentValue == DrawerValue.Open
                        if (isOpen != localSidebarVisible) {
                            onVisibilityChange(isOpen)
                        }
                    }
                }

                if (isCompact) {
                    ModalNavigationDrawer(
                        drawerState = drawerState,
                        gesturesEnabled = true,
                        drawerContent = {
                            ModalDrawerSheet(
                                modifier = Modifier.width(280.dp),
                                drawerContainerColor = MaterialTheme.colorScheme.surfaceVariant
                            ) {
                                ResponsiveSidebarContent(
                                    isExpanded = true,
                                    selectedAgent = selectedAgent,
                                    onAgentSelected = { 
                                        navController.navigate(it.route) { 
                                            popUpTo(navController.graph.startDestinationRoute ?: "search") { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true 
                                        }
                                        onVisibilityChange(false)
                                    }
                                )
                            }
                        }
                    ) {
                        WorkspaceContent(
                            navController = navController,
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                } else {
                    Row(modifier = Modifier.fillMaxSize()) {
                        // Tablets & Desktop: Expanding Side Panel
                        val targetWidth = if (localSidebarVisible) 280.dp else 80.dp
                        val animatedWidth by animateDpAsState(
                            targetValue = targetWidth,
                            animationSpec = spring(
                                dampingRatio = Spring.DampingRatioNoBouncy,
                                stiffness = Spring.StiffnessLow
                            ),
                            label = "SidebarWidth"
                        )
    
                        Box(
                            modifier = Modifier
                                .width(animatedWidth)
                                .fillMaxHeight()
                                .background(MaterialTheme.colorScheme.surfaceVariant)
                                .drawBehind {
                                    drawLine(
                                        color = Color(0xFFE7E0EC),
                                        start = Offset(size.width, 0f),
                                        end = Offset(size.width, size.height),
                                        strokeWidth = 1.dp.toPx()
                                    )
                                }
                        ) {
                            ResponsiveSidebarContent(
                                isExpanded = localSidebarVisible,
                                selectedAgent = selectedAgent,
                                onAgentSelected = { 
                                    navController.navigate(it.route) { 
                                        popUpTo(navController.graph.startDestinationRoute ?: "search") { saveState = true }
                                        launchSingleTop = true
                                        restoreState = true 
                                    }
                                }
                            )
                        }

                        WorkspaceContent(
                            navController = navController,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ResponsiveSidebarContent(
    isExpanded: Boolean,
    selectedAgent: GrantAgent,
    onAgentSelected: (GrantAgent) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(12.dp)
    ) {
        Column(modifier = Modifier.height(84.dp)) {
            AnimatedVisibility(
                visible = isExpanded,
                enter = fadeIn() + expandHorizontally(),
                exit = fadeOut() + shrinkHorizontally()
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Box(
                        modifier = Modifier
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                            .padding(bottom = 8.dp)
                    ) {
                        Text(
                            text = "AGENTS",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            letterSpacing = 1.sp
                        )
                    }
                    Text(
                        text = "Grantit",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )
                    Text(
                        text = "Multi-Agent Grant System",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                        modifier = Modifier.padding(start = 16.dp, end = 16.dp, bottom = 12.dp),
                        maxLines = 1
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        GrantAgent.entries.forEach { agent ->
            val isSelected = agent == selectedAgent
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = if (isExpanded) Arrangement.Start else Arrangement.Center,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .clip(RoundedCornerShape(50))
                    .background(if (isSelected) MaterialTheme.colorScheme.primaryContainer else Color.Transparent)
                    .clickable { onAgentSelected(agent) }
                    .padding(horizontal = if (isExpanded) 16.dp else 0.dp)
            ) {
                Icon(
                    imageVector = agent.icon,
                    contentDescription = agent.title,
                    tint = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(24.dp)
                )
                AnimatedVisibility(
                    visible = isExpanded,
                    enter = fadeIn() + expandHorizontally(),
                    exit = fadeOut() + shrinkHorizontally()
                ) {
                    Row {
                        Spacer(modifier = Modifier.width(16.dp))
                        Text(
                            text = agent.title,
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}

@Composable
fun TopBar(
    isSidebarVisible: Boolean,
    onToggleSidebar: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(64.dp)
            .background(MaterialTheme.colorScheme.background)
            .drawBehind {
                drawLine(
                    color = Color(0xFFE7E0EC),
                    start = Offset(0f, size.height),
                    end = Offset(size.width, size.height),
                    strokeWidth = 1.dp.toPx()
                )
            }
            .padding(horizontal = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(MaterialTheme.colorScheme.primary, shape = CircleShape)
                    .clickable { onToggleSidebar() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Menu,
                    contentDescription = "Menu",
                    tint = MaterialTheme.colorScheme.onPrimary,
                    modifier = Modifier.size(24.dp)
                )
            }
            Text(
                text = "Grantit",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onBackground,
                letterSpacing = (-0.5).sp
            )
        }
        
        Row(
            modifier = Modifier
                .height(40.dp)
                .clip(RoundedCornerShape(50))
                .background(MaterialTheme.colorScheme.primaryContainer)
                .clickable { onToggleSidebar() }
                .padding(horizontal = 20.dp)
                .testTag("sidebar_toggle"),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = if (isSidebarVisible) "Hide Menu" else "Show Menu",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onPrimaryContainer
            )
        }
    }
}

@Composable
fun WorkspaceContent(navController: NavHostController, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .background(MaterialTheme.colorScheme.surface)
            .padding(16.dp)
    ) {
        GrantSystemNavHost(navController = navController)
    }
}

@Composable
fun GrantSystemNavHost(
    navController: NavHostController,
    startDestination: String = "search"
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable("search") { 
            SearchScreen(navController = navController) 
        }
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
        composable("copywriter") { 
            CopywriterScreen() 
        }
        composable("administration") { 
            AdminScreen() 
        }
        composable("settings") { 
            SettingsScreen() 
        }
    }
}

enum class GrantAgent(val title: String, val route: String, val icon: ImageVector) {
    SEARCH("Grant Search", "search", Icons.Default.Search),
    EVALUATION("Evaluation", "evaluation", Icons.Default.RateReview),
    COPYWRITER("Proposal Copywriter", "copywriter", Icons.Default.Create),
    ADMINISTRATION("Administration", "administration", Icons.Default.AdminPanelSettings),
    SETTINGS("Settings", "settings", Icons.Default.Settings)
}

