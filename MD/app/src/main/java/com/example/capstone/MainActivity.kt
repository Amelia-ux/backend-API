package com.example.capstone

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.MediaRecorder
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.os.Handler
import android.provider.Settings
import android.text.Html
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AlertDialog
import com.google.android.material.bottomnavigation.BottomNavigationView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import com.bumptech.glide.Glide
import com.bumptech.glide.load.resource.gif.GifDrawable
import com.bumptech.glide.request.target.SimpleTarget
import com.example.capstone.api.Api
import com.example.capstone.api.UploadResponse
import com.example.capstone.databinding.ActivityMainBinding
import java.io.File
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.*
import com.google.android.material.floatingactionbutton.FloatingActionButton
import okhttp3.MediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory


class MainActivity : AppCompatActivity() {

    private lateinit var startButton: FloatingActionButton
    private lateinit var mediaRecorder: MediaRecorder
    private var isRecording = false
    private var handler: Handler = Handler()
    private var recordingDuration: Long = 10000
    private var isClicked = false
    private lateinit var tvKategori: TextView
    private lateinit var tvSolusi: TextView
    private lateinit var tvRecording: TextView
    private lateinit var ivKategori: ImageView
    private lateinit var imgGif: ImageView
    private lateinit var api: Api


    private lateinit var binding: ActivityMainBinding

    @RequiresApi(Build.VERSION_CODES.M)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val navView: BottomNavigationView = binding.bottom
        navView.background = null

        imgGif = findViewById(R.id.img_gif)
        tvRecording = findViewById(R.id.tv_recording)


        val gifUrl = "https://raw.githubusercontent.com/gauravk95/audio-visualizer-android/master/samplegif/circle_line_sample.gif"

        Glide.with(this)
            .asGif()
            .load(gifUrl)
            .into(object : SimpleTarget<GifDrawable>() {
                override fun onResourceReady(
                    resource: GifDrawable,
                    transition: com.bumptech.glide.request.transition.Transition<in GifDrawable>?
                ) {
                    imgGif.setImageDrawable(resource)
                    resource.start()
                }
            })

        val retrofit = Retrofit.Builder()
            .baseUrl("https://getprediction-7rpnuc6dkq-as.a.run.app/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        api = retrofit.create(Api::class.java)


        startButton = findViewById(R.id.record)
        startButton.setOnClickListener {
            if (isRecording) {
                stopRecording()
            } else {
                if (checkRecordAudioPermission()) {
                    isClicked = !isClicked
                    imgGif.visibility = View.VISIBLE
                    tvRecording.text = "Recording..."
                    updateFloatingButton()
                    startRecording()
                    handler.postDelayed({
                        stopRecording()
                        isClicked = false
                        imgGif.visibility = View.GONE
                        tvRecording.visibility = View.GONE
                        updateFloatingButton()
                        result()
                    }, recordingDuration)
                } else {
                    requestRecordAudioPermission()
                }
            }
        }
    }

    @RequiresApi(Build.VERSION_CODES.M)
    private fun updateFloatingButton() {
        if (isClicked) {

            startButton.backgroundTintList = getColorStateList(R.color.abu)
            startButton.imageTintList = getColorStateList(R.color.red_but)

        } else {
            startButton.backgroundTintList = getColorStateList(R.color.red_but)
            startButton.imageTintList = getColorStateList(R.color.white)
        }
    }

    private fun checkRecordAudioPermission(): Boolean {
        val permission = Manifest.permission.RECORD_AUDIO
        return ActivityCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED
    }

    private fun requestRecordAudioPermission() {
        val permission = Manifest.permission.RECORD_AUDIO
        ActivityCompat.requestPermissions(this, arrayOf(permission), REQUEST_RECORD_AUDIO_PERMISSION)
    }

    private fun startRecording() {
        if (isRecording) {
            return
        }

        isRecording = true

        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val fileName = "recording_$timeStamp.wav"
        val directory = getExternalFilesDir(Environment.DIRECTORY_MUSIC)
        val filePath = File(directory, fileName).absolutePath

        mediaRecorder = MediaRecorder().apply {
            setAudioSource(MediaRecorder.AudioSource.MIC)
            setOutputFormat(MediaRecorder.OutputFormat.DEFAULT)
            setAudioEncoder(MediaRecorder.AudioEncoder.DEFAULT)
            setOutputFile(filePath)

            try {
                prepare()
                start()
            } catch (e: IOException) {
                e.printStackTrace()
            }
        }
    }

    private fun stopRecording() {
        if (!isRecording) {
            return
        }

        isRecording = false

        try {
            mediaRecorder.stop()
            mediaRecorder.release()
        } catch (e: Exception) {
            e.printStackTrace()
        }

        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val directory = getExternalFilesDir(Environment.DIRECTORY_MUSIC)
        val fileName = "recording_$timeStamp.wav"
        val filePath = File(directory, fileName).absolutePath

        Toast.makeText(this, "Recording saved: $filePath", Toast.LENGTH_LONG).show()
        val audioFileUri = Uri.parse(filePath)
        val audioFile = File(audioFileUri.path)
        val requestFile = RequestBody.create(MediaType.parse("audio/wav"), audioFile)
        val audioPart = MultipartBody.Part.createFormData("audio", audioFile.name, requestFile)
        uploadAudio(audioPart)
    }


    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_RECORD_AUDIO_PERMISSION) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startRecording()
                handler.postDelayed({
                    stopRecording()
                }, recordingDuration)
            } else {
                showPermissionDeniedMessage()
            }
        }
    }

    private fun showPermissionDeniedMessage() {

        val message = "Aplikasi memerlukan izin untuk merekam audio. Mohon izinkan izin ini untuk melanjutkan."

        AlertDialog.Builder(this)
            .setTitle("Izin Diperlukan")
            .setMessage(message)
            .setPositiveButton("Pengaturan") { dialog, _ ->
                openAppSettings()
                dialog.dismiss()
            }
            .setNegativeButton("Tutup") { dialog, _ ->
                dialog.dismiss()
            }
            .show()
    }

    private fun openAppSettings() {
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
        val uri = Uri.fromParts("package", packageName, null)
        intent.data = uri
        startActivity(intent)
    }
    companion object {
        private const val REQUEST_RECORD_AUDIO_PERMISSION = 200
    }

    private fun result(){
        tvKategori = findViewById(R.id.tv_hasilKategori)
        tvSolusi = findViewById(R.id.tv_solusi)
        ivKategori = findViewById(R.id.iv_kategori)


        val apiResult = 0

        val dataSolusi = resources.getStringArray(R.array.data_solusi)
        val dataKategori = resources.getStringArray(R.array.data_kategori)
        val dataGambar = resources.getStringArray(R.array.data_gambar)

        val hasilKategori = dataKategori[apiResult]
        val hasilSolusi = dataSolusi[apiResult]
        val hasilGambar = dataGambar[apiResult]

        tvKategori.text = hasilKategori
        tvKategori.visibility = View.VISIBLE

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            tvSolusi.text = Html.fromHtml(hasilSolusi, Html.FROM_HTML_MODE_COMPACT)
        } else {
            tvSolusi.text =Html.fromHtml(hasilSolusi)
        }
        tvSolusi.visibility = View.VISIBLE
        ivKategori.visibility = View.VISIBLE

    }
    private fun uploadAudio(audioPart: MultipartBody.Part) {
        val call = api.uploadAudio(audioPart)
        call.enqueue(object : Callback<UploadResponse> {
            override fun onResponse(call: Call<UploadResponse>, response: Response<UploadResponse>) {
                if (response.isSuccessful) {
                    showToast("File audio berhasil diunggah!")
                } else {
                    showToast("Gagal mengunggah file audio. Kode status: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<UploadResponse>, t: Throwable) {
                showToast("Gagal melakukan permintaan: ${t.message}")
            }
        })
    }

    private fun Context.showToast(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }
}