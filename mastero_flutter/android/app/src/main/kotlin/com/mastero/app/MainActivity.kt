package com.mastero.app

import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.WindowManager
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
            var wifiNetwork: android.net.Network? = null
            var cellNetwork: android.net.Network? = null
            for (network in cm.allNetworks) {
                val caps = cm.getNetworkCapabilities(network) ?: continue
                if (caps.hasTransport(NetworkCapabilities.TRANSPORT_VPN)) continue
                if (caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) && wifiNetwork == null) wifiNetwork = network
                if (caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) && cellNetwork == null) cellNetwork = network
            }
            val target = wifiNetwork ?: cellNetwork
            if (target != null) cm.bindProcessToNetwork(target)
        } catch (_: Exception) {}
    }

    override fun onCreate(savedInstanceState: Bundle?) {
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
