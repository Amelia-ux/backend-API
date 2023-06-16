package com.example.capstone.api

import okhttp3.MultipartBody
import retrofit2.Call
import retrofit2.http.*

interface Api {
    @Multipart
    @POST("/")
    fun uploadAudio(@Part audio: MultipartBody.Part): Call<UploadResponse>
}