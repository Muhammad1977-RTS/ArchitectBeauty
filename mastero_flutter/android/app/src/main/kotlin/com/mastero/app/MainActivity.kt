package com.mastero.app

import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.WindowManager
import android.util.Log
import io.flutter.embedding.android.FlutterActivity

class MainActivity : FlutterActivity() {
    private val handler = Handler(Looper.getMainLooper())
    private val clearSecure = object : Runnable {
        override fun run() {
            window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
            handler.postDelayed(this, 300)
        }
    }

    private fun bindToNonVpnNetwork() {
        try {
            val cm = getSystemService(CONNECTIVITY_SERVICE) as ConnectivityManager
            var bound = false
            for (network in cm.allNetworks) {
                val caps = cm.getNetworkCapabilities(network) ?: continue
                val isVpn = caps.hasTransport(NetworkCapabilities.TRANSPORT_VPN)
                val isWifi = caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)
                val isCellular = caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)
                val notVpnCap = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_VPN)
                Log.d("MasteroNet", "net=$network vpn=$isVpn wifi=$isWifi cell=$isCellular notVpnCap=$notVpnCap")
                if (!isVpn && (isWifi || isCellular)) {
                    cm.bindProcessToNetwork(network)
                    Log.d("MasteroNet", "Bound to: $network")
                    bound = true
                    break
                }
            }
            if (!bound) Log.w("MasteroNet", "No non-VPN network found")
        } catch (e: Exception) {
            Log.e("MasteroNet", "Error: $e")
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        // Показываем поверх экрана блокировки и включаем экран
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            )
        }
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        super.onCreate(savedInstanceState)
        window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
        handler.post(clearSecure)
        bindToNonVpnNetwork()
    }

    override fun onDestroy() {
        handler.removeCallbacks(clearSecure)
        super.onDestroy()
    }
}
