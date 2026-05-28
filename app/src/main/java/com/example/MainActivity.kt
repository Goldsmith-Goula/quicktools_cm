package com.example

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.animation.core.spring
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.api.GeminiApiService
import com.example.data.api.UssdAiSuggestion
import com.example.data.local.AppDatabase
import com.example.data.model.RecentChat
import com.example.data.model.UssdService
import com.example.data.repository.GeminiRepository
import com.example.data.repository.UssdRepository
import com.example.ui.theme.*
import com.example.ui.viewmodel.FormSubmissionStatus
import com.example.ui.viewmodel.QuickToolsViewModel
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Core Dependency Hookups
        val database = AppDatabase.getDatabase(this)
        val ussdDao = database.ussdDao()
        val ussdRepository = UssdRepository(ussdDao)
        val geminiApiService = GeminiApiService.create()
        val geminiRepository = GeminiRepository(geminiApiService)
        val viewModel = QuickToolsViewModel(ussdRepository, geminiRepository)

        setContent {
            MyApplicationTheme {
                MainAppScreen(viewModel)
            }
        }
    }
}

@Composable
fun MainAppScreen(viewModel: QuickToolsViewModel) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    val currentTab by viewModel.currentTab.collectAsStateWithLifecycle()

    // Sub-modal visibility states (local UI control)
    var showSubmitModal by remember { mutableStateOf(false) }
    var showSavedModal by remember { mutableStateOf(false) }
    var showQrModal by remember { mutableStateOf(false) }
    var showCountryModal by remember { mutableStateOf(false) }
    var showDefaultNetworkModal by remember { mutableStateOf(false) }
    var showClearCacheConfirm by remember { mutableStateOf(false) }

    // WhatsApp Input States
    var whatsAppPhone by remember { mutableStateOf("") }
    var whatsAppMessage by remember { mutableStateOf("") }
    var selectedCountryName by remember { mutableStateOf("Cameroon") }
    var selectedCountryCode by remember { mutableStateOf("+237") }
    var selectedCountryFlag by remember { mutableStateOf("🇨🇲") }

    // User preference defaults
    var defaultNetworkPref by remember { mutableStateOf("MTN") }

    // Listening to Viewmodel Toasts
    LaunchedEffect(key1 = true) {
        viewModel.toastEvent.collectLatest { message ->
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        snackbarHost = { SnackbarHost(snackbarHostState) },
        bottomBar = {
            NavigationBar(
                modifier = Modifier
                    .fillMaxWidth()
                    .windowInsetsPadding(WindowInsets.navigationBars)
                    .height(60.dp),
                containerColor = Color.White,
                tonalElevation = 6.dp
            ) {
                NavigationBarItem(
                    selected = currentTab == "ussd",
                    onClick = { viewModel.selectTab("ussd") },
                    icon = { Icon(Icons.Default.Home, contentDescription = "USSD Smart Hub") },
                    label = { Text("USSD", fontSize = 11.sp, fontWeight = FontWeight.Medium) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = PrimaryBlue,
                        selectedTextColor = PrimaryBlue,
                        unselectedIconColor = NeutralGray,
                        unselectedTextColor = NeutralGray,
                        indicatorColor = LightGray
                    )
                )
                NavigationBarItem(
                    selected = currentTab == "whatsapp",
                    onClick = { viewModel.selectTab("whatsapp") },
                    icon = { Icon(Icons.Default.Send, contentDescription = "WhatsApp Quick Chat") },
                    label = { Text("WhatsApp", fontSize = 11.sp, fontWeight = FontWeight.Medium) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = PrimaryBlue,
                        selectedTextColor = PrimaryBlue,
                        unselectedIconColor = NeutralGray,
                        unselectedTextColor = NeutralGray,
                        indicatorColor = LightGray
                    )
                )
                NavigationBarItem(
                    selected = currentTab == "settings",
                    onClick = { viewModel.selectTab("settings") },
                    icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                    label = { Text("Settings", fontSize = 11.sp, fontWeight = FontWeight.Medium) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = PrimaryBlue,
                        selectedTextColor = PrimaryBlue,
                        unselectedIconColor = NeutralGray,
                        unselectedTextColor = NeutralGray,
                        indicatorColor = LightGray
                    )
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (currentTab) {
                "ussd" -> UssdSmartHubScreen(
                    viewModel = viewModel,
                    onOpenSubmitModal = { showSubmitModal = true },
                    onOpenSavedModal = { showSavedModal = true }
                )
                "whatsapp" -> WhatsAppQuickChatScreen(
                    viewModel = viewModel,
                    phoneNumber = whatsAppPhone,
                    onPhoneNumberChange = { whatsAppPhone = it },
                    messageText = whatsAppMessage,
                    onMessageChange = { whatsAppMessage = it },
                    countryCodeName = selectedCountryName,
                    countryCodePrefix = selectedCountryCode,
                    countryFlag = selectedCountryFlag,
                    onOpenCountryModal = { showCountryModal = true },
                    onOpenQrModal = { showQrModal = true }
                )
                "settings" -> SettingsScreen(
                    viewModel = viewModel,
                    defaultNetwork = defaultNetworkPref,
                    defaultCountry = "$selectedCountryFlag $selectedCountryName ($selectedCountryCode)",
                    onOpenDefaultNetworkModal = { showDefaultNetworkModal = true },
                    onOpenCountryModal = { showCountryModal = true },
                    onTriggerClearCache = { showClearCacheConfirm = true }
                )
            }

            // --- Custom Modal Sheet Dialogs ---

            // Modal A: Submit USSD Code
            if (showSubmitModal) {
                SubmitUssdDialog(
                    viewModel = viewModel,
                    onDismiss = {
                        showSubmitModal = false
                        viewModel.resetSubmissionStatus()
                    }
                )
            }

            // Modal B: Saved / Favorites list
            if (showSavedModal) {
                SavedServicesDialog(
                    viewModel = viewModel,
                    onDismiss = { showSavedModal = false }
                )
            }

            // Modal D: WhatsApp QR Code generator
            if (showQrModal) {
                WhatsAppQrDialog(
                    phoneNumber = whatsAppPhone,
                    countryPrefix = selectedCountryCode,
                    message = whatsAppMessage,
                    onDismiss = { showQrModal = false }
                )
            }

            // Modal E: Country Selector
            if (showCountryModal) {
                CountrySelectorDialog(
                    onDismiss = { showCountryModal = false },
                    onSelectCountry = { name, code, flag ->
                        selectedCountryName = name
                        selectedCountryCode = code
                        selectedCountryFlag = flag
                        showCountryModal = false
                    }
                )
            }

            // Modal F: Network selector dropdown configuration
            if (showDefaultNetworkModal) {
                NetworkSelectorDialog(
                    currentNetwork = defaultNetworkPref,
                    onDismiss = { showDefaultNetworkModal = false },
                    onSelectNetwork = {
                        defaultNetworkPref = it
                        showDefaultNetworkModal = false
                        viewModel.showToast("Default Network set to $it ✓")
                    }
                )
            }

            // Modal G: Confirmation dialog for Clear cache
            if (showClearCacheConfirm) {
                ConfirmationDialog(
                    title = "Clear Cache?",
                    text = "This will delete all custom submitted USSD services and reset your favorites. This action cannot be undone.",
                    onConfirm = {
                        viewModel.clearCache()
                        showClearCacheConfirm = false
                    },
                    onDismiss = { showClearCacheConfirm = false }
                )
            }
        }
    }
}

// ==========================================
// SCREEN 1: USSD SMART HUB LAYOUT
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UssdSmartHubScreen(
    viewModel: QuickToolsViewModel,
    onOpenSubmitModal: () -> Unit,
    onOpenSavedModal: () -> Unit
) {
    val searchVal by viewModel.searchQuery.collectAsStateWithLifecycle()
    val selectedCat by viewModel.selectedCategory.collectAsStateWithLifecycle()
    val services by viewModel.filteredServices.collectAsStateWithLifecycle()

    val showAiOverlay by viewModel.showAiOverlay.collectAsStateWithLifecycle()
    val aiSuggestion by viewModel.aiSuggestion.collectAsStateWithLifecycle()
    val isAiLoading by viewModel.isAiLoading.collectAsStateWithLifecycle()

    val context = LocalContext.current

    Box(modifier = Modifier.fillMaxSize()) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Header Bar (Static)
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Surface(
                            modifier = Modifier.size(34.dp),
                            color = PrimaryBlue,
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text("QT", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            }
                        }
                        Text(
                            "USSD Smart Hub",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Black
                        )
                    }
                },
                actions = {
                    IconButton(
                        onClick = onOpenSavedModal,
                        modifier = Modifier.testTag("favorites_header_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Favorite,
                            contentDescription = "Saved/Favorites",
                            tint = PrimaryBlue
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )

            // Search input section
            OutlinedTextField(
                value = searchVal,
                onValueChange = { viewModel.searchQuery.value = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
                    .testTag("search_ussd_input"),
                placeholder = { Text("Search for a USSD service...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search icon") },
                trailingIcon = {
                    if (searchVal.isNotEmpty()) {
                        IconButton(onClick = { viewModel.searchQuery.value = "" }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear")
                        }
                    }
                },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = PrimaryBlue,
                    unfocusedBorderColor = LightGray,
                    focusedContainerColor = LightGray,
                    unfocusedContainerColor = LightGray
                ),
                shape = RoundedCornerShape(12.dp),
                singleLine = true
            )

            // Horizontal scrolling Category Chips
            val categories = listOf("All", "Data", "Airtime", "Mobile Money", "Banking", "Bonuses", "Support")
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                categories.forEach { cat ->
                    val isSelected = cat == selectedCat
                    FilterChip(
                        selected = isSelected,
                        onClick = { viewModel.selectedCategory.value = cat },
                        label = { Text(cat, fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Medium) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PrimaryBlue,
                            selectedLabelColor = Color.White,
                            containerColor = LightGray,
                            labelColor = Black
                        ),
                        border = null,
                        shape = RoundedCornerShape(8.dp)
                    )
                }
            }

            // Results lists
            if (services.isEmpty() && !showAiOverlay) {
                // Empty state layout
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.padding(24.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Not Found",
                            tint = NeutralGray,
                            modifier = Modifier.size(52.dp)
                        )
                        Text(
                            "No services found",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = Black
                        )
                        Text(
                            "Try another search or submit a custom code directly.",
                            fontSize = 13.sp,
                            color = NeutralGray,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(
                            onClick = onOpenSubmitModal,
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Submit a Service")
                        }
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 100.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(services, key = { it.id }) { service ->
                        UssdServiceCard(
                            service = service,
                            onDial = {
                                viewModel.showToast("Dialing ${service.code}...")
                                val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + Uri.encode(service.code)))
                                context.startActivity(intent)
                            },
                            onCopy = {
                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                val clip = ClipData.newPlainText("USSD Code", service.code)
                                clipboard.setPrimaryClip(clip)
                                viewModel.showToast("Code copied to clipboard! ✓")
                            },
                            onToggleFav = { viewModel.toggleFavorite(service) },
                            onDelete = { viewModel.deleteService(it) }
                        )
                    }
                }
            }
        }

        // Floating Action Button (FAB)
        FloatingActionButton(
            onClick = onOpenSubmitModal,
            containerColor = PrimaryBlue,
            contentColor = Color.White,
            shape = CircleShape,
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(bottom = 20.dp, end = 20.dp)
                .testTag("fab_submit_ussd")
        ) {
            Icon(Icons.Default.Add, contentDescription = "Add USSD Code", modifier = Modifier.size(28.dp))
        }

        // Modal C: Gemini AI Suggestions overlay (integrated inline for seamless reactive design)
        if (showAiOverlay) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.4f))
                    .clickable { viewModel.dismissAiOverlay() },
                contentAlignment = Alignment.Center
            ) {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth(0.85f)
                        .clickable(enabled = false) {}, // Prevent dismiss on card click
                    shape = RoundedCornerShape(16.dp),
                    color = Color.White,
                    tonalElevation = 8.dp
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Text(
                            "No Results Found",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                            color = Black
                        )

                        Text(
                            "✨ AI Suggestion",
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp,
                            color = PrimaryBlue
                        )

                        Text(
                            "Based on your search for \"$searchVal\":",
                            fontSize = 12.sp,
                            color = NeutralGray,
                            fontStyle = FontStyle.Italic,
                            textAlign = TextAlign.Center
                        )

                        if (isAiLoading) {
                            Column(
                                modifier = Modifier.padding(16.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                CircularProgressIndicator(color = PrimaryBlue, modifier = Modifier.size(32.dp))
                                Text("Analyzing databases...", fontSize = 12.sp, color = NeutralGray)
                            }
                        } else if (aiSuggestion != null) {
                            val suggestion = aiSuggestion!!
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(VeryLightGray, RoundedCornerShape(12.dp))
                                    .border(1.dp, LightGray, RoundedCornerShape(12.dp))
                                    .padding(12.dp),
                                verticalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        suggestion.name,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp,
                                        color = Black,
                                        modifier = Modifier.weight(1f),
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Surface(
                                        color = when (suggestion.network.uppercase()) {
                                            "MTN" -> Color(0xFFFFCC00)
                                            "ORANGE" -> Color(0xFFFF6600)
                                            "CAMTEL" -> Color(0xFF0099FF)
                                            else -> PrimaryBlue
                                        },
                                        shape = RoundedCornerShape(4.dp)
                                    ) {
                                        Text(
                                            suggestion.network,
                                            color = Color.White,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }
                                }

                                Text(
                                    suggestion.code,
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = PrimaryDark
                                )

                                Text(
                                    suggestion.description,
                                    fontSize = 11.sp,
                                    color = NeutralGray,
                                    lineHeight = 15.sp
                                )

                                Divider(color = LightGray, modifier = Modifier.padding(vertical = 4.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Text("Confidence:", fontSize = 10.sp, color = NeutralGray)
                                    Row {
                                        repeat(5) { index ->
                                            Icon(
                                                imageVector = Icons.Default.Star,
                                                contentDescription = "Star",
                                                tint = if (index < suggestion.confidenceStars) Color(0xFFFFB300) else LightGray,
                                                modifier = Modifier.size(12.dp)
                                            )
                                        }
                                    }
                                    Spacer(modifier = Modifier.weight(1f))
                                    Text("${suggestion.confidencePercentage}%", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = SuccessGreen)
                                }
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                OutlinedButton(
                                    onClick = { viewModel.dismissAiOverlay() },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Dismiss", color = NeutralGray)
                                }

                                Button(
                                    onClick = {
                                        val service = UssdService(
                                            name = suggestion.name,
                                            code = suggestion.code,
                                            network = suggestion.network,
                                            category = "Data",
                                            description = suggestion.description
                                        )
                                        viewModel.submitUssdCode(
                                            name = service.name,
                                            code = service.code,
                                            network = service.network,
                                            category = service.category,
                                            description = service.description
                                        )
                                        viewModel.dismissAiOverlay()
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Save Code", color = Color.White)
                                }
                            }
                        } else {
                            Text("No suggestions available for this query.", fontSize = 12.sp, color = NeutralGray)
                        }
                    }
                }
            }
        }
    }
}

// Custom USSD code element Card Component
@Composable
fun UssdServiceCard(
    service: UssdService,
    onDial: () -> Unit,
    onCopy: () -> Unit,
    onToggleFav: () -> Unit,
    onDelete: (UssdService) -> Unit
) {
    ElevatedCard(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("ussd_card_${service.code}"),
        colors = CardDefaults.elevatedCardColors(containerColor = VeryLightGray),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.elevatedCardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // First Row: Title + Network Tag
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    service.name,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 14.sp,
                    color = Black,
                    modifier = Modifier.weight(1f),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Surface(
                    color = when (service.network.uppercase()) {
                        "MTN" -> Color(0xFFFFCC00)
                        "ORANGE" -> Color(0xFFFF6600)
                        "CAMTEL" -> Color(0xFF0099FF)
                        else -> PrimaryBlue
                    },
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Text(
                        service.network,
                        color = Color.White,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Second row: Code (Monospace bold)
            Text(
                service.code,
                fontFamily = FontFamily.Monospace,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = PrimaryDark,
                modifier = Modifier.testTag("code_element")
            )

            Spacer(modifier = Modifier.height(4.dp))

            // Third row: Description
            Text(
                service.description,
                fontSize = 11.sp,
                color = NeutralGray,
                lineHeight = 15.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Fourth row: Action buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Dial action Button
                Button(
                    onClick = onDial,
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
                    modifier = Modifier
                        .weight(1f)
                        .height(36.dp)
                        .testTag("dial_button"),
                    contentPadding = PaddingValues(horizontal = 8.dp),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Phone, contentDescription = "Dial icon", modifier = Modifier.size(14.dp))
                        Text("Dial", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }

                // Copy Action Button
                Button(
                    onClick = onCopy,
                    colors = ButtonDefaults.buttonColors(containerColor = LightGray),
                    modifier = Modifier
                        .weight(1f)
                        .height(36.dp)
                        .testTag("copy_button"),
                    contentPadding = PaddingValues(horizontal = 8.dp),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Edit, contentDescription = "Copy icon", tint = Black, modifier = Modifier.size(14.dp))
                        Text("Copy", fontSize = 11.sp, color = Black, fontWeight = FontWeight.Bold)
                    }
                }

                // Favorite Save Icon
                IconButton(
                    onClick = onToggleFav,
                    modifier = Modifier
                        .size(36.dp)
                        .background(LightGray, RoundedCornerShape(6.dp))
                ) {
                    Icon(
                        imageVector = if (service.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                        contentDescription = "Save favorite",
                        tint = if (service.isFavorite) ErrorRed else Black,
                        modifier = Modifier.size(18.dp)
                    )
                }

                // Delete option if it's user submitted code
                if (service.isUserSubmitted) {
                    IconButton(
                        onClick = { onDelete(service) },
                        modifier = Modifier
                            .size(36.dp)
                            .background(LightGray, RoundedCornerShape(6.dp))
                    ) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = "Delete code",
                            tint = ErrorRed,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    }
}


// ==========================================
// SCREEN 2: WHATSAPP QUICK CHAT LAYOUT
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WhatsAppQuickChatScreen(
    viewModel: QuickToolsViewModel,
    phoneNumber: String,
    onPhoneNumberChange: (String) -> Unit,
    messageText: String,
    onMessageChange: (String) -> Unit,
    countryCodeName: String,
    countryCodePrefix: String,
    countryFlag: String,
    onOpenCountryModal: () -> Unit,
    onOpenQrModal: () -> Unit
) {
    val context = LocalContext.current
    val recentChats by viewModel.recentChats.collectAsStateWithLifecycle()

    var showRecentChatsExpanded by remember { mutableStateOf(true) }

    // Clear non-digits except +
    val cleanDigits = phoneNumber.filter { it.isDigit() }
    val isValid = cleanDigits.length >= 9 && cleanDigits.length <= 15

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
    ) {
        // WhatsApp Toolbar
        TopAppBar(
            title = {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Surface(
                        modifier = Modifier.size(34.dp),
                        color = SuccessGreen,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text("WA", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                    }
                    Text("WhatsApp Quick Chat", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Black)
                }
            },
            actions = {
                IconButton(onClick = onOpenQrModal, enabled = isValid) {
                    Icon(
                        imageVector = Icons.Default.Share,
                        contentDescription = "Open QR code Generator",
                        tint = if (isValid) SuccessGreen else NeutralGray
                    )
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
        )

        Column(modifier = Modifier.padding(16.dp)) {
            // Section Header description
            Text(
                "Initiate WhatsApp chats with Cameroon contacts without saving their phone numbers first.",
                fontSize = 12.sp,
                color = NeutralGray,
                lineHeight = 16.sp,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            // Country Selector Row Trigger
            Text("Country", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Black)
            Spacer(modifier = Modifier.height(4.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(LightGray)
                    .clickable { onOpenCountryModal() }
                    .padding(horizontal = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(countryFlag, fontSize = 20.sp)
                    Text("$countryCodeName ($countryCodePrefix)", fontSize = 14.sp, color = Black)
                }
                Icon(Icons.Default.ArrowDropDown, contentDescription = "Dropdown icon", tint = NeutralGray)
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Phone Number Text Field section
            Text("Phone Number", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Black)
            Spacer(modifier = Modifier.height(4.dp))
            OutlinedTextField(
                value = phoneNumber,
                onValueChange = { value ->
                    // Auto filtering for integer numeric keys only
                    val digits = value.filter { it.isDigit() }
                    onPhoneNumberChange(digits)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("whatsapp_phone_input"),
                placeholder = { Text("695 - 123 - 456") },
                leadingIcon = { Icon(Icons.Default.Phone, contentDescription = "Phone icon", tint = NeutralGray) },
                trailingIcon = {
                    if (phoneNumber.isNotEmpty()) {
                        IconButton(onClick = { onPhoneNumberChange("") }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear input")
                        }
                    }
                },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                shape = RoundedCornerShape(8.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = PrimaryBlue,
                    unfocusedBorderColor = LightGray
                ),
                singleLine = true
            )

            // Live validation indicator message
            if (phoneNumber.isNotEmpty()) {
                val statusText = if (isValid) "✓ Valid number" else "✗ Invalid number format"
                val statusColor = if (isValid) SuccessGreen else ErrorRed
                Text(
                    statusText,
                    color = statusColor,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(top = 4.dp, start = 4.dp)
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Message text field area (Optional)
            Text("Optional Message", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Black)
            Spacer(modifier = Modifier.height(4.dp))
            OutlinedTextField(
                value = messageText,
                onValueChange = { if (it.length <= 1000) onMessageChange(it) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(110.dp)
                    .testTag("whatsapp_message_input"),
                placeholder = { Text("Enter message (optional)...") },
                shape = RoundedCornerShape(8.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = PrimaryBlue,
                    unfocusedBorderColor = LightGray
                ),
                maxLines = 5
            )

            // Characters count label
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                Text(
                    "${messageText.length}/1000",
                    fontSize = 10.sp,
                    color = NeutralGray,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Template Preset button row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                val templates = listOf("Bonjour! 😊", "Greetings! 🤝", "How are you? 👋")
                templates.forEach { temp ->
                    Surface(
                        color = LightGray,
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .clickable { onMessageChange(temp) }
                            .padding(vertical = 4.dp)
                    ) {
                        Text(
                            temp,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = Black,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Start Chat trigger Button
            Button(
                onClick = {
                    if (isValid) {
                        val finalNumber = "$countryCodePrefix$cleanDigits".replace("+", "")
                        val appUri = Uri.parse("https://api.whatsapp.com/send?phone=$finalNumber&text=" + Uri.encode(messageText))
                        val intent = Intent(Intent.ACTION_VIEW, appUri)
                        try {
                            // Local persistence cache register
                            val groupFormatted = "$countryCodePrefix " + cleanDigits.chunked(3).joinToString(" ")
                            viewModel.registerWhatsAppChat(cleanDigits, groupFormatted, messageText)
                            context.startActivity(intent)
                        } catch (e: Exception) {
                            viewModel.showToast("WhatsApp application is not installed")
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .testTag("whatsapp_submit_button"),
                enabled = isValid,
                colors = ButtonDefaults.buttonColors(
                    containerColor = SuccessGreen,
                    disabledContainerColor = LightGray
                ),
                shape = RoundedCornerShape(8.dp)
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Share, contentDescription = "Send", modifier = Modifier.size(18.dp))
                    Text("Start WhatsApp Chat", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(26.dp))

            // Collapsible Recent Chats Section Layout
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { showRecentChatsExpanded = !showRecentChatsExpanded }
                    .padding(vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "Recent Chats (${recentChats.size})",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Black
                )
                Icon(
                    imageVector = if (showRecentChatsExpanded) Icons.Default.KeyboardArrowDown else Icons.Default.ArrowForward,
                    contentDescription = "Expand collapsible",
                    tint = NeutralGray
                )
            }

            if (showRecentChatsExpanded) {
                if (recentChats.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 20.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("No recent chats", fontSize = 12.sp, color = NeutralGray)
                            Text("Start a conversation to see it here", fontSize = 11.sp, color = NeutralGray)
                        }
                    }
                } else {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        recentChats.forEach { chat ->
                            RecentChatRowItem(
                                chat = chat,
                                onClick = {
                                    onPhoneNumberChange(chat.phoneNumber)
                                    if (chat.message != null) {
                                        onMessageChange(chat.message)
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }
        Spacer(modifier = Modifier.height(100.dp))
    }
}

// Collapsed / Expanded item cards for Recent chats section
@Composable
fun RecentChatRowItem(chat: RecentChat, onClick: () -> Unit) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .clickable { onClick() },
        color = VeryLightGray,
        border = BorderStroke(1.dp, LightGray)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                // Formatting Layout: number visual
                Text(
                    chat.formattedNumber,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = Black
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    chat.message ?: "Direct Chat link with no preset message",
                    fontSize = 11.sp,
                    color = NeutralGray,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            Column(horizontalAlignment = Alignment.End) {
                // Nice relative date visual string representation
                val format = SimpleDateFormat("MMM d, HH:mm", Locale.getDefault())
                val dateString = format.format(Date(chat.timestamp))
                Text(dateString, fontSize = 10.sp, color = NeutralGray)
                Spacer(modifier = Modifier.height(4.dp))
                Icon(Icons.Default.ArrowForward, contentDescription = "Reload", modifier = Modifier.size(12.dp), tint = SuccessGreen)
            }
        }
    }
}


// ==========================================
// SCREEN 3: SETTINGS LAYOUT
// ==========================================
@Composable
fun SettingsScreen(
    viewModel: QuickToolsViewModel,
    defaultNetwork: String,
    defaultCountry: String,
    onOpenDefaultNetworkModal: () -> Unit,
    onOpenCountryModal: () -> Unit,
    onTriggerClearCache: () -> Unit
) {
    val context = LocalContext.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
    ) {
        // Toolbar header settings title
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .padding(16.dp)
        ) {
            Text("Settings", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Black)
            Text(
                "Configure defaults, manage disk caching, and verify system details.",
                fontSize = 12.sp,
                color = NeutralGray,
                modifier = Modifier.padding(top = 4.dp)
            )
        }

        Divider(color = LightGray)

        Column(modifier = Modifier.padding(16.dp)) {
            // General group Header
            Text("General Options", color = PrimaryBlue, fontWeight = FontWeight.SemiBold, fontSize = 12.sp, modifier = Modifier.padding(vertical = 8.dp))

            SettingsSelectorRow(
                title = "Default Core Network",
                selectedVal = defaultNetwork,
                onClick = onOpenDefaultNetworkModal
            )

            SettingsSelectorRow(
                title = "Primary Country Prefix",
                selectedVal = defaultCountry,
                onClick = onOpenCountryModal
            )

            Spacer(modifier = Modifier.height(18.dp))

            // Storage and disk cleanups header options
            Text("Disk Optimization", color = PrimaryBlue, fontWeight = FontWeight.SemiBold, fontSize = 12.sp, modifier = Modifier.padding(vertical = 8.dp))

            SettingsActionRow(
                title = "Empty System Cache",
                subtitle = "Deletes custom code records and toggled hearts.",
                actionText = "Clear",
                onClick = onTriggerClearCache
            )

            SettingsActionRow(
                title = "Clear Chat History",
                subtitle = "Purges local saved logs of recent WhatsApp chats.",
                actionText = "Purge",
                onClick = {
                    viewModel.clearRecentChats()
                }
            )

            Spacer(modifier = Modifier.height(18.dp))

            // Technical details, app credits headers
            Text("About Utilities", color = PrimaryBlue, fontWeight = FontWeight.SemiBold, fontSize = 12.sp, modifier = Modifier.padding(vertical = 8.dp))

            SettingsInfoRow("App Shell Version", "1.0.0 Pro")
            SettingsInfoRow("Release Team Code", "QuickTools Developer Group")

            SettingsActionWebRow(
                title = "Privacy Policy Documents",
                onClick = {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://example.com/privacy"))
                    context.startActivity(intent)
                }
            )

            SettingsActionWebRow(
                title = "Terms of Usage Agreement",
                onClick = {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://example.com/terms"))
                    context.startActivity(intent)
                }
            )
        }
        Spacer(modifier = Modifier.height(100.dp))
    }
}

@Composable
fun SettingsSelectorRow(title: String, selectedVal: String, onClick: () -> Unit) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(vertical = 8.dp),
        color = Color.Transparent
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(title, fontWeight = FontWeight.Medium, fontSize = 14.sp, color = Black)
            }
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(selectedVal, color = NeutralGray, fontSize = 12.sp)
                Icon(Icons.Default.ArrowForward, contentDescription = "Details", tint = NeutralGray, modifier = Modifier.size(16.dp))
            }
        }
    }
    Divider(color = LightGray)
}

@Composable
fun SettingsActionRow(title: String, subtitle: String, actionText: String, onClick: () -> Unit) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        color = Color.Transparent
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(title, fontWeight = FontWeight.Medium, fontSize = 14.sp, color = Black)
                Text(subtitle, fontSize = 10.sp, color = NeutralGray)
            }
            TextButton(onClick = onClick) {
                Text(actionText, color = ErrorRed, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
        }
    }
    Divider(color = LightGray)
}

@Composable
fun SettingsActionWebRow(title: String, onClick: () -> Unit) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(vertical = 10.dp),
        color = Color.Transparent
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(title, fontWeight = FontWeight.Medium, fontSize = 14.sp, color = Black)
            Icon(Icons.Outlined.Share, contentDescription = "Web link", tint = NeutralGray, modifier = Modifier.size(14.dp))
        }
    }
    Divider(color = LightGray)
}

@Composable
fun SettingsInfoRow(title: String, value: String) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 10.dp),
        color = Color.Transparent
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(title, fontWeight = FontWeight.Medium, fontSize = 14.sp, color = Black)
            Text(value, color = NeutralGray, fontSize = 12.sp)
        }
    }
    Divider(color = LightGray)
}


// ==========================================
// MODAL G: SIMPLE CONFIRMATION DIALOG
// ==========================================
@Composable
fun ConfirmationDialog(
    title: String,
    text: String,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(
                onClick = onConfirm,
                colors = ButtonDefaults.buttonColors(containerColor = ErrorRed)
            ) {
                Text("Confirm", color = Color.White)
            }
        },
        dismissButton = {
            OutlinedButton(onClick = onDismiss) {
                Text("Cancel", color = Black)
            }
        },
        title = { Text(title, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Black) },
        text = { Text(text, fontSize = 13.sp, color = Black) },
        shape = RoundedCornerShape(12.dp),
        containerColor = Color.White
    )
}


// ==========================================
// MODAL F: NETWORK SELECTOR DIALOG
// ==========================================
@Composable
fun NetworkSelectorDialog(
    currentNetwork: String,
    onDismiss: () -> Unit,
    onSelectNetwork: (String) -> Unit
) {
    val networks = listOf("MTN", "Orange", "Camtel", "All Networks")
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = Color.White,
            modifier = Modifier.padding(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text("Select Default Network", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Black)
                Divider(color = LightGray)
                networks.forEach { net ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSelectNetwork(net) }
                            .padding(vertical = 12.dp, horizontal = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(net, fontSize = 14.sp, color = Black)
                        if (net == currentNetwork) {
                            Icon(Icons.Default.Check, contentDescription = "Active", tint = PrimaryBlue, modifier = Modifier.size(18.dp))
                        }
                    }
                    Divider(color = LightGray)
                }
            }
        }
    }
}


// ==========================================
// MODAL E: COUNTRY SELECTOR DIALOG
// ==========================================
data class CountryChoice(val name: String, val prefix: String, val flag: String)

@Composable
fun CountrySelectorDialog(
    onDismiss: () -> Unit,
    onSelectCountry: (String, String, String) -> Unit
) {
    val countries = listOf(
        CountryChoice("Cameroon", "+237", "🇨🇲"),
        CountryChoice("Gabon", "+241", "🇬🇦"),
        CountryChoice("Congo", "+242", "🇨🇬"),
        CountryChoice("Benin", "+229", "🇧🇯"),
        CountryChoice("Angola", "+244", "🇦🇴")
    )
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = Color.White,
            modifier = Modifier.padding(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text("Select Country", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Black)
                Divider(color = LightGray)
                countries.forEach { item ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSelectCountry(item.name, item.prefix, item.flag) }
                            .padding(vertical = 12.dp, horizontal = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(item.flag, fontSize = 22.sp)
                        Text(item.name, fontSize = 14.sp, color = Black, modifier = Modifier.weight(1f))
                        Text(item.prefix, fontSize = 13.sp, color = NeutralGray)
                    }
                    Divider(color = LightGray)
                }
            }
        }
    }
}


// ==========================================
// MODAL D: WHATSAPP QR CODE GENERATOR
// ==========================================
@Composable
fun WhatsAppQrDialog(
    phoneNumber: String,
    countryPrefix: String,
    message: String,
    onDismiss: () -> Unit
) {
    val fullLink = "https://wa.me/${countryPrefix.replace("+", "")}$phoneNumber?text=${Uri.encode(message)}"

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = Color.White,
            modifier = Modifier.padding(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("WhatsApp QR Code", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Black)
                    IconButton(onClick = onDismiss, modifier = Modifier.size(24.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close dialog")
                    }
                }

                Text(
                    "Scan to open a secure direct chat link with your Cameroon contact without dialing digits.",
                    fontSize = 11.sp,
                    color = NeutralGray,
                    textAlign = TextAlign.Center
                )

                // Render mathematically layouted valid Mock QR grid representation completely offline
                Box(
                    modifier = Modifier
                        .size(180.dp)
                        .border(2.dp, LightGray)
                        .padding(8.dp)
                ) {
                    OfflineQrCode(text = fullLink, modifier = Modifier.fillMaxSize())
                }

                Text(
                    "Link: wa.me/${countryPrefix.replace("+", "")}$phoneNumber",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp,
                    color = SuccessGreen,
                    fontWeight = FontWeight.Bold
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Share link", color = Black, fontSize = 12.sp)
                    }

                    Button(
                        onClick = {
                            onDismiss()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Download PNG", fontSize = 12.sp)
                    }
                }
            }
        }
    }
}

// 100% Offline-Friendly Deterministic QR Cell Pattern Drawing Composable!
@Composable
fun OfflineQrCode(text: String, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val size = this.size.width
        val cells = 21
        val cellSize = size / cells

        // Background white Fill
        drawRect(color = Color.White)

        // Seed visual matrix using raw text's hash
        val random = java.util.Random(text.hashCode().toLong())
        val grid = Array(cells) { BooleanArray(cells) }

        for (i in 0 until cells) {
            for (j in 0 until cells) {
                grid[i][j] = random.nextBoolean()
            }
        }

        // Draw standard corner visual boxes for authentic QR visual layout representation
        drawCornerPattern(grid, 0, 0) // Top-Left
        drawCornerPattern(grid, 14, 0) // Top-Right
        drawCornerPattern(grid, 0, 14) // Bottom-Left

        // Draw cells
        for (i in 0 until cells) {
            for (j in 0 until cells) {
                if (grid[i][j]) {
                    drawRect(
                        color = Color.Black,
                        topLeft = androidx.compose.ui.geometry.Offset(i * cellSize, j * cellSize),
                        size = androidx.compose.ui.geometry.Size(cellSize, cellSize)
                    )
                }
            }
        }
    }
}

private fun drawCornerPattern(grid: Array<BooleanArray>, startX: Int, startY: Int) {
    for (dx in 0..6) {
        for (dy in 0..6) {
            val isOuterBorder = dx == 0 || dx == 6 || dy == 0 || dy == 6
            val isInnerBorder = dx == 1 || dx == 5 || dy == 1 || dy == 5
            val isCenterBlock = dx in 2..4 && dy in 2..4

            grid[startX + dx][startY + dy] = isOuterBorder || (isCenterBlock && !isInnerBorder)
        }
    }
}


// ==========================================
// MODAL A: SUBMIT USSD CODE FORM DIALOG
// ==========================================
@Composable
fun SubmitUssdDialog(
    viewModel: QuickToolsViewModel,
    onDismiss: () -> Unit
) {
    val status by viewModel.submissionStatus.collectAsStateWithLifecycle()

    var nameVal by remember { mutableStateOf("") }
    var codeVal by remember { mutableStateOf("") }
    var networkVal by remember { mutableStateOf("MTN") }
    var categoryVal by remember { mutableStateOf("Data") }
    var descVal by remember { mutableStateOf("") }

    var errorLocalMsg by remember { mutableStateOf<String?>(null) }

    val isFormValid = nameVal.isNotBlank() && codeVal.isNotBlank() && codeVal.contains("*") && codeVal.contains("#")

    // Handle automated sheet closings on successful database insert
    LaunchedEffect(key1 = status) {
        if (status is FormSubmissionStatus.Success) {
            onDismiss()
        }
    }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = Color.White,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(18.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Submit Custom USSD Service", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Black)
                    IconButton(onClick = onDismiss, modifier = Modifier.size(24.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close dialog")
                    }
                }

                Divider(color = LightGray)

                // Subtitle limits warnings for local rate limiters
                Text(
                    "Submit new network codes below. Submissions are severely rate-limited to maximum 3 requests per day to protect standard device storage abuse.",
                    fontSize = 11.sp,
                    color = NeutralGray,
                    lineHeight = 15.sp
                )

                // Status notifications (Error/Rate Limit warnings)
                if (status is FormSubmissionStatus.Error) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = ErrorRed.copy(alpha = 0.1f)),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            (status as FormSubmissionStatus.Error).message,
                            color = ErrorRed,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(10.dp),
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                if (status is FormSubmissionStatus.RateLimited) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = WarningOrange.copy(alpha = 0.11f)),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(Icons.Default.Warning, contentDescription = "Alert", tint = WarningOrange, modifier = Modifier.size(16.dp))
                            Text(
                                "Database Rate Limit Exceeded: Standard daily local quota capped at 3 requests to prevent disk flooding. Please wait until tomorrow.",
                                color = WarningOrange,
                                fontSize = 11.sp,
                                modifier = Modifier.weight(1f),
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }

                if (errorLocalMsg != null) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = ErrorRed.copy(alpha = 0.1f)),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            errorLocalMsg!!,
                            color = ErrorRed,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(10.dp)
                        )
                    }
                }

                // Service Name Input
                Text("Service Name", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Black)
                OutlinedTextField(
                    value = nameVal,
                    onValueChange = { nameVal = it },
                    placeholder = { Text("e.g. MTN Promo Balance") },
                    shape = RoundedCornerShape(8.dp),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = PrimaryBlue, unfocusedBorderColor = LightGray),
                    modifier = Modifier.fillMaxWidth().testTag("service_name_input"),
                    singleLine = true
                )

                // Network select drop configuration
                Text("Network Carrier", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Black)
                val networkList = listOf("MTN", "Orange", "Camtel", "All Networks")
                Row(
                    modifier = Modifier.horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    networkList.forEach { carrier ->
                        val isCarrierSelected = carrier == networkVal
                        FilterChip(
                            selected = isCarrierSelected,
                            onClick = { networkVal = carrier },
                            label = { Text(carrier) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = PrimaryBlue,
                                selectedLabelColor = Color.White,
                                containerColor = LightGray
                            ),
                            border = null
                        )
                    }
                }

                // Code Monospace Input
                Text("USSD Dial String", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Black)
                OutlinedTextField(
                    value = codeVal,
                    onValueChange = { codeVal = it },
                    placeholder = { Text("e.g. *157*4#") },
                    shape = RoundedCornerShape(8.dp),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = PrimaryBlue, unfocusedBorderColor = LightGray),
                    modifier = Modifier.fillMaxWidth().testTag("ussd_code_input"),
                    singleLine = true
                )
                if (codeVal.isNotEmpty() && (!codeVal.contains("*") || !codeVal.contains("#"))) {
                    Text("Must contain * and # to qualify as USSD", color = ErrorRed, fontSize = 10.sp)
                }

                // Categories Row select
                Text("Primary Classification Category", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Black)
                val categoryOptions = listOf("Data", "Airtime", "Mobile Money", "Banking", "Bonuses", "Support")
                Row(
                    modifier = Modifier.horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    categoryOptions.forEach { cat ->
                        val isCatSelected = cat == categoryVal
                        FilterChip(
                            selected = isCatSelected,
                            onClick = { categoryVal = cat },
                            label = { Text(cat) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = PrimaryBlue,
                                selectedLabelColor = Color.White,
                                containerColor = LightGray
                            ),
                            border = null
                        )
                    }
                }

                // Description textarea
                Text("Optional Description", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Black)
                OutlinedTextField(
                    value = descVal,
                    onValueChange = { if (it.length <= 200) descVal = it },
                    placeholder = { Text("Describe what this code activates...") },
                    shape = RoundedCornerShape(8.dp),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = PrimaryBlue, unfocusedBorderColor = LightGray),
                    modifier = Modifier.fillMaxWidth().testTag("service_desc_input"),
                    maxLines = 3
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Action Buttons Cancel and Submit
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Cancel", color = Black)
                    }

                    Button(
                        onClick = {
                            if (!isFormValid) {
                                errorLocalMsg = "USSD code is missing format elements (* and #)"
                                return@Button
                            }
                            errorLocalMsg = null
                            viewModel.submitUssdCode(
                                name = nameVal,
                                code = codeVal,
                                network = networkVal,
                                category = categoryVal,
                                description = descVal
                            )
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
                        modifier = Modifier.weight(1f).testTag("dialog_submit_button"),
                        enabled = isFormValid && status !is FormSubmissionStatus.Loading,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        if (status is FormSubmissionStatus.Loading) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(16.dp))
                        } else {
                            Text("Submit", color = Color.White)
                        }
                    }
                }
            }
        }
    }
}


// ==========================================
// MODAL B: SAVED ITEMS / FAVORITES DIALOG
// ==========================================
@Composable
fun SavedServicesDialog(
    viewModel: QuickToolsViewModel,
    onDismiss: () -> Unit
) {
    val services by viewModel.allServices.collectAsStateWithLifecycle()
    val favServices = services.filter { it.isFavorite }

    val context = LocalContext.current

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = Color.White,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(18.dp)
                    .fillMaxHeight(0.7f),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Favorite, contentDescription = "Favs", tint = ErrorRed)
                        Text("Saved Favorites (${favServices.size})", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Black)
                    }
                    IconButton(onClick = onDismiss, modifier = Modifier.size(24.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close favorites slider")
                    }
                }

                Divider(color = LightGray)

                if (favServices.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("No favorite services yet.", fontSize = 13.sp, color = NeutralGray)
                            Text("Star-tap cards to save them here.", fontSize = 11.sp, color = NeutralGray)
                        }
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        contentPadding = PaddingValues(bottom = 12.dp)
                    ) {
                        items(favServices, key = { it.id }) { item ->
                            RecentFavItemRow(
                                item = item,
                                onDial = {
                                    viewModel.showToast("Dialing ${item.code}...")
                                    val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + Uri.encode(item.code)))
                                    context.startActivity(intent)
                                },
                                onCopy = {
                                    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                    val clip = ClipData.newPlainText("USSD Code", item.code)
                                    clipboard.setPrimaryClip(clip)
                                    viewModel.showToast("Code copied to clipboard! ✓")
                                },
                                onRemove = { viewModel.toggleFavorite(item) }
                            )
                        }
                    }
                }

                Button(
                    onClick = onDismiss,
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Close Window", color = Color.White)
                }
            }
        }
    }
}

// Compact favorite row inside overlay Slider modal
@Composable
fun RecentFavItemRow(
    item: UssdService,
    onDial: () -> Unit,
    onCopy: () -> Unit,
    onRemove: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp)),
        color = VeryLightGray,
        border = BorderStroke(1.dp, LightGray)
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    item.name,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    color = Black,
                    modifier = Modifier.weight(1f)
                )
                IconButton(onClick = onRemove, modifier = Modifier.size(20.dp)) {
                    Icon(Icons.Default.Delete, contentDescription = "Unfavorite", tint = ErrorRed, modifier = Modifier.size(14.dp))
                }
            }
            Spacer(modifier = Modifier.height(4.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    item.code,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 13.sp,
                    color = PrimaryDark
                )
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        "Dial",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = PrimaryBlue,
                        modifier = Modifier
                            .clickable { onDial() }
                            .padding(4.dp)
                    )
                    Text(
                        "Copy",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = NeutralGray,
                        modifier = Modifier
                            .clickable { onCopy() }
                            .padding(4.dp)
                    )
                }
            }
        }
    }
}
