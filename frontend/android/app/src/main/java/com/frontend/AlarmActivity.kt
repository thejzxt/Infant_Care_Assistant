package com.frontend

import android.app.Activity
import android.media.MediaPlayer
import android.os.Bundle
import android.os.Vibrator
import android.os.VibrationEffect
import android.content.Context
import android.content.Intent
import android.widget.Button
import android.widget.TextView

class AlarmActivity : Activity() {

    private lateinit var mediaPlayer: MediaPlayer
    private lateinit var vibrator: Vibrator

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(
    android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
)
        setContentView(R.layout.activity_alarm)

        val titleText = findViewById<TextView>(R.id.alarmTitle)
        val stopButton = findViewById<Button>(R.id.stopButton)
        

        val title = intent.getStringExtra("title") ?: "Feeding Time"

        titleText.text = title

        vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            vibrator.vibrate(
                VibrationEffect.createWaveform(
                    longArrayOf(0, 1000, 1000),
                    0
                )
            )
        } else {
            vibrator.vibrate(longArrayOf(0,1000,1000),0)
        }

        mediaPlayer = MediaPlayer.create(this, R.raw.alarm_sound)
        mediaPlayer.isLooping = true
        mediaPlayer.start()
stopButton.setOnClickListener {

    stopAlarm()

    // close the alarm activity completely
    finish()

    // force stop the activity process if still running
    android.os.Process.killProcess(android.os.Process.myPid())
}
        
    }

    private fun stopAlarm() {

    try {
        if (::mediaPlayer.isInitialized) {
            if (mediaPlayer.isPlaying) {
                mediaPlayer.stop()
            }
            mediaPlayer.release()
        }
    } catch (e: Exception) {
        e.printStackTrace()
    }

    try {
        if (::vibrator.isInitialized) {
            vibrator.cancel()
        }
    } catch (e: Exception) {
        e.printStackTrace()
    }
}
override fun onDestroy() {
    super.onDestroy()
    stopAlarm()
}

override fun onPause() {
    super.onPause()
    stopAlarm()
}
}