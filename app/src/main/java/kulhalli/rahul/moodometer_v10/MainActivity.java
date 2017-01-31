package kulhalli.rahul.moodometer_v10;

import android.Manifest;
import android.app.ProgressDialog;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Base64;
import android.util.Log;
import android.util.SparseArray;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.Toast;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import com.google.android.gms.vision.Frame;
import com.google.android.gms.vision.face.Face;
import com.google.android.gms.vision.face.FaceDetector;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;


public class MainActivity extends AppCompatActivity {
    /*
    *
    * Developer - Rahul Kulhalli
    *
    * Flow =
    * 1) Android captures photo
    * 2) Photo is cropped using Face API
    * 3) Converted to Base64 string and sent to Flask Server
    * 4) Flask will host model
    *
    * */


    private static final int CAMERA_REQUEST_CODE = 0;
    private static final int PERM_REQUEST_CODE = 111;
    private static final String URL = "http://54.200.191.184/saveEmotions";
    private ImageView imageView;
    private Bitmap bitmap;
    private File globalFile;
    private float smilingProbability;

    //the three emotion buttons
    private ImageView happy;
    private ImageView neutral;
    private ImageView sad;

    private boolean isCameraButtonClicked = false;

    private static final int HAPPY = 1;
    private static final int NEUTRAL = 2;
    private static final int SAD = 3;

    private int emotion;
    private String base64String;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Log.d("PERM_CHECK", "Checking permissions..");
        checkPermissions();
        Button startCameraButton = (Button) findViewById(R.id.camera);
        imageView = (ImageView) findViewById(R.id.image);

        happy = (ImageView) findViewById(R.id.happy);
        neutral = (ImageView) findViewById(R.id.neutral);
        sad = (ImageView) findViewById(R.id.sad);

        if (startCameraButton != null) {
            startCameraButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    isCameraButtonClicked = true;
                    Intent startCamera = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                    File imageFile = new File(Environment.getExternalStorageDirectory(), "image_capture.jpg");
                    globalFile = imageFile;
                    Uri imageFileUri = Uri.fromFile(imageFile);
                    startCamera.putExtra(MediaStore.EXTRA_OUTPUT, imageFileUri);
                    startActivityForResult(startCamera, CAMERA_REQUEST_CODE);
                }
            });
        }

        happy.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                //first, set other two image to not-clickable
                sad.setClickable(false);
                neutral.setClickable(false);
                if(isCameraButtonClicked){
                    emotion = HAPPY;
                    setUpVolleyRequest(base64String, emotion);
                }
                else{
                    Log.d("CAMERA_NOT_CLICKED","Not clicked photo first!");
                    Toast.makeText(MainActivity.this, "Please click an image first...", Toast.LENGTH_LONG).show();
                }
            }
        });

        sad.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                happy.setClickable(false);
                neutral.setClickable(false);
                if(isCameraButtonClicked){
                    emotion = SAD;
                    setUpVolleyRequest(base64String, emotion);
                }
                else{
                    Log.d("CAMERA_NOT_CLICKED","Not clicked photo first!");
                    Toast.makeText(MainActivity.this, "Please click an image first...", Toast.LENGTH_LONG).show();
                }
            }
        });

        neutral.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                happy.setClickable(false);
                sad.setClickable(false);
                if(isCameraButtonClicked){
                    emotion = NEUTRAL;
                    setUpVolleyRequest(base64String, emotion);
                }
                else{
                    Log.d("CAMERA_NOT_CLICKED","Not clicked photo first!");
                    Toast.makeText(MainActivity.this, "Please click an image first...", Toast.LENGTH_LONG).show();
                }
            }
        });

    }
    private void checkPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if(this.checkSelfPermission(Manifest.permission.READ_EXTERNAL_STORAGE)!= PackageManager.PERMISSION_GRANTED
                    && this.checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE)!=PackageManager.PERMISSION_GRANTED
                    && this.checkSelfPermission(Manifest.permission.INTERNET)!=PackageManager.PERMISSION_GRANTED
                    && this.checkSelfPermission(Manifest.permission.CAMERA)!=PackageManager.PERMISSION_GRANTED){
                Log.d("NO_PERMISSIONS","Permissions not granted");
                this.requestPermissions(new String[]{Manifest.permission.READ_EXTERNAL_STORAGE,
                        Manifest.permission.WRITE_EXTERNAL_STORAGE, Manifest.permission.INTERNET,
                        Manifest.permission.CAMERA}, PERM_REQUEST_CODE);
            }
        }
        else{
            Log.d("PERMS_OKAY", "Not Android M... Permissions granted in Manifest...");
        }
    }
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        //super.onActivityResult(requestCode, resultCode, data);
        if(requestCode == CAMERA_REQUEST_CODE && resultCode == RESULT_OK && data!=null){
            Uri fileUri = data.getData();
            Bitmap image = null;
            try{
                image = BitmapFactory.decodeStream(getContentResolver().openInputStream(fileUri));
            }catch(FileNotFoundException fe){
                Log.e("BITMAP_DECODE","Error decoding Bitmap...");
                fe.printStackTrace();
            }
            //bitmap = image;
            //first, make sure that bitmap is in portrait mode
            Log.d("ORIENT","Verifying orientation...");
            Bitmap _image = verifyOrientation(image);

            cropImage(_image);
            //imageView.setImageBitmap(image);
        }
        else Log.e("INTENT_ERROR","Something went wrong with the intent...");
    }
    private Bitmap verifyOrientation(Bitmap bitmap) {
        Log.d("ORIENT","In orientation check..");
        int rotate = 0;
        Matrix matrix = new Matrix();
        ExifInterface exifInterface;
        try {
            if (globalFile != null) {
                this.getContentResolver().notifyChange(Uri.fromFile(globalFile), null);
                exifInterface = new ExifInterface(globalFile.getAbsolutePath());
                int orientation = exifInterface.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL);
                switch (orientation) {
                    case ExifInterface.ORIENTATION_ROTATE_270:
                        rotate = -90;
                        break;
                    case ExifInterface.ORIENTATION_ROTATE_90:
                        rotate = 90;
                        break;
                    case ExifInterface.ORIENTATION_ROTATE_180:
                        rotate = 180;
                        break;
                    case ExifInterface.ORIENTATION_NORMAL:
                        return bitmap;
                }
                matrix.setRotate(rotate);
                return Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        //worst case, if NOTHING happens
        return bitmap;
    }

    public void cropImage(Bitmap bitmap){
        Log.d("IN_CROP", "In cropper..");
        FaceDetector detector = new FaceDetector.Builder(MainActivity.this)
                .setTrackingEnabled(false)
                .setClassificationType(FaceDetector.ALL_CLASSIFICATIONS)
                .setProminentFaceOnly(true)
                .setLandmarkType(FaceDetector.ALL_LANDMARKS)
                .setMode(FaceDetector.ACCURATE_MODE)
                .build();

        if(!detector.isOperational()){
            Log.d("NOT_OPERATIONAL","Face is not operational!");
        }

        Frame frame = new Frame.Builder()
                .setBitmap(bitmap)
                .build();

        SparseArray<Face> faces = detector.detect(frame);
        Log.d("FOUND_FACES","Found "+faces.size()+" faces!");
        Bitmap result = null;
        for(int i=0;i<faces.size();i++){

            Face face = faces.valueAt(i);
            Log.d("SMILING_PROB","Smiling probability :: "+String.valueOf(face.getIsSmilingProbability()));
            smilingProbability = face.getIsSmilingProbability();

            Toast.makeText(MainActivity.this, "Smiling probability: "+face.getIsSmilingProbability(), Toast.LENGTH_LONG).show();
            //get coordinates of face
            float x1 = face.getPosition().x;
            float y1 = face.getPosition().y;
            Log.d("COORDINATES", x1 + ", " + y1);

            Bitmap cropped = Bitmap.createBitmap(bitmap, (int)x1, (int)y1, (int)face.getWidth()+10, (int)face.getHeight()+10);
            Log.d("FACE_COORDS", (int) x1 + ", " + (int) y1 + ", " + (int) (face.getWidth() + 10) +
                    ", " + (int) (face.getHeight() + 10));

            Log.d("NEW_CROPPED_SPECS", cropped.getWidth()+""+cropped.getHeight());

            result = cropped;
        }

        //finally, release the detector
        Log.d("DETECTOR_RELEASE","Releasing detector...");
        detector.release();

        //set imageView
        imageView.setImageBitmap(result);

        Log.d("VOLLEY_REQ", "Setting up volley request...");


        //---------------Converting cropped image to Base64 string------------------------------
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        if(result!=null){
            result.compress(Bitmap.CompressFormat.JPEG, 100, byteArrayOutputStream);
            base64String = Base64.encodeToString(byteArrayOutputStream.toByteArray(), Base64.DEFAULT);
            Log.d("B_64_STR", base64String);
            //setUpVolleyRequest(base64String, 2);
        }
        else{
            Log.d("NULL", "NULL bitmap");
        }
        //--------------------------------------------------------------------------------------
    }

    private void setUpVolleyRequest(final String encoded_base64_str, final int detected_emotion) {
        Log.d("VOLLEY","Setting up request...");


        JSONObject dataToSend = new JSONObject();
        try {
            dataToSend.put("base64string", base64String);
            dataToSend.put("emotion", String.valueOf(emotion));
            dataToSend.put("smiling_probability", String.valueOf(smilingProbability));

            Log.d("SENDING_JSON_b6d", dataToSend.getString("base64string"));
            Log.d("SENDING_JSON_emotion", dataToSend.getString("emotion"));
            Log.d("SENDING_JSON_smile", dataToSend.getString("smiling_probability"));

        }catch(JSONException e){
            e.printStackTrace();
        }


        final ProgressDialog dialog = new ProgressDialog(MainActivity.this);
        dialog.setMessage(String.valueOf("Please wait, the face is being evaluated..."));
        dialog.show();
        JsonObjectRequest request = new JsonObjectRequest(
                Request.Method.POST,
                URL,
                dataToSend,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        dialog.cancel();
                        Log.d("REQUEST_S","Response! Success!");
                        //switch over to new activity
                        try{
                            String result = response.getString("Result");
                            if("OK".equals(result)){
                                Log.d("GOT_OK", "Got OK message..");
                                String emotions = response.getString("emotions");
                                Intent newIntent = new Intent(MainActivity.this, OnJsonResponseReceived.class);
                                newIntent.putExtra("raw_text", emotions);
                                startActivity(newIntent);
                            }
                            else{
                                Toast.makeText(MainActivity.this, "Something went wrong...", Toast.LENGTH_LONG).show();
                            }
                        }catch(JSONException e){
                            Log.d("JSON_EXCEPTION", e.getMessage());
                        }
                    }
                },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.e("VOLLEY_ERROR", error.getMessage());
                    }
                }
        )
        {
            @Override
            protected Map<String, String> getParams() throws AuthFailureError {
                return super.getParams();
            }

            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {
                //return super.getHeaders();
                Map<String,String> headers = new HashMap<>();
                headers.put("Content-Type","application/json");
                return headers;
            }
        };

        RequestQueue queue = Volley.newRequestQueue(MainActivity.this);
        queue.add(request);
    }
}