package kulhalli.rahul.moodometer_v10;

import android.Manifest;
import android.app.ProgressDialog;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.support.v4.content.FileProvider;
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
import com.android.volley.DefaultRetryPolicy;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import com.google.android.gms.vision.Frame;
import com.google.android.gms.vision.face.Face;
import com.google.android.gms.vision.face.FaceDetector;
//import com.google.android.gms.samples.vision.face.patch.SafeFaceDetector;
import org.acra.ACRA;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
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
    private static final String URL = "<SERVER URL>/upload";    //subject to change! Please update if EC2 instance is rebooted!
    private ImageView imageView;
    private Bitmap bitmap;
    private File globalFile;
    private String gString;
    private float smilingProbability;
    private long time_start;
    private long time_end;

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

                    File x = new File(Environment.getExternalStorageDirectory(),"mood_o_meter");

                    if(!x.exists()){    //if it doesn't already exist
                        boolean result = x.mkdir();
                        if(!result){     //AND if mkdir fails,
                            Log.d("DIRECTORY_ERROR", "Cannot create directory...");
                            ACRA.getErrorReporter().handleException(new Exception("Directory creation failed..."));
                        }
                        else{
                            Log.d("DIR_CREATED", "Created directory...");
                        }
                    }else{
                        Log.d("ALREADY_EXISTS", "Directory already exists");
                        Log.d("ROOT_DIR_CONTENTS", Arrays.toString(Environment.getExternalStorageDirectory().list()));
                    }

                    File imageFile = new File(x, "image_capture.jpg");
                    //globalFile = imageFile;

                    gString = "file:"+imageFile.getAbsolutePath();

                    //replace with FileProvider
                    Uri fileProviderUri = FileProvider.getUriForFile(MainActivity.this, BuildConfig.APPLICATION_ID+".provider", imageFile);

                    //Uri imageFileUri = Uri.fromFile(imageFile);

                    startCamera.putExtra(MediaStore.EXTRA_OUTPUT, fileProviderUri);
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
            Log.d("PERMS_OKAY", "Permissions have been granted");
        }
    }
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if(requestCode == CAMERA_REQUEST_CODE && resultCode == RESULT_OK){

            Uri imageUri = Uri.parse(gString);
            Bitmap img = null;

            if(imageUri == null){
                Log.d("URI_NULL", "URI is null");
            }
            else{
                try {
                    img = BitmapFactory.decodeStream(getContentResolver().openInputStream(imageUri));
                }catch(FileNotFoundException e){
                    e.printStackTrace();
                }
            }

            if(img!=null){
                Log.d("GOT_IMG", "Retrieved bitmap! ");

                //bitmap = image;
                //first, make sure that bitmap is in portrait mode

                Log.d("ORIENT","Verifying orientation...");

                Bitmap _image = verifyOrientation(img);

                cropImage(_image);
                //imageView.setImageBitmap(image);
            }
            else{
                Log.d("NO_ANY", "No bitmap retrieved...");
            }
        }
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

            Toast.makeText(MainActivity.this, "Sorry, it seems that FaceDetector hasn't yet been installed on your device. " +
                    "Total internal memory : "+MemoryUtility.getTotalInternalMemory(MainActivity.this)+", Total free " +
                    "internal memory: "+MemoryUtility.getPercentageMemoryFree(MainActivity.this), Toast.LENGTH_LONG).show();

            if(MemoryUtility.getPercentageMemoryFree(MainActivity.this) <= 10){
                Toast.makeText(MainActivity.this, "It seems as if you have less than 10% free internal memory." +
                        "Please clear some data and retry.", Toast.LENGTH_LONG).show();
            }

            IntentFilter lowstorageFilter = new IntentFilter(Intent.ACTION_DEVICE_STORAGE_LOW);
            boolean hasLowStorage = registerReceiver(null, lowstorageFilter) != null;

            if (hasLowStorage) {
                Toast.makeText(this, "LOW STORAGE", Toast.LENGTH_LONG).show();
                Log.w("LOW_STORAGE", "Phone has low storage space...");
            }
        }

        Frame frame = new Frame.Builder()
                .setBitmap(bitmap)
                .build();

        SparseArray<Face> faces = detector.detect(frame);
        Log.d("FOUND_FACES","Found "+faces.size()+" faces!");
        Bitmap result = null;
        for(int i=0;i<faces.size();i++){

            Face face = faces.valueAt(i);
            Log.d("SMILING_PROBABILITY","Smiling probability :: "+String.valueOf(face.getIsSmilingProbability()));
            smilingProbability = face.getIsSmilingProbability();

            Toast.makeText(MainActivity.this, "Smiling probability: "+face.getIsSmilingProbability(), Toast.LENGTH_LONG).show();
            //get coordinates of face
            float x1 = face.getPosition().x;
            float y1 = face.getPosition().y;
            Log.d("COORDINATES", x1 + ", " + y1);

            Bitmap cropped = Bitmap.createBitmap(bitmap, (int)x1, (int)y1, (int)face.getWidth()+10, (int)face.getHeight()+10);
            Log.d("FACE_COORDINATES", (int) x1 + ", " + (int) y1 + ", " + (int) (face.getWidth() + 10) +
                    ", " + (int) (face.getHeight() + 10));

            Log.d("NEW_CROPPED_SPECS", cropped.getWidth()+""+cropped.getHeight());

            result = cropped;
        }

        //if no face found, directly image message as-is
        if(faces.size() == 0){
            Log.d("NO_FACE_FOUND", "No faces found in the image!");
            imageView.setImageBitmap(bitmap);
            convertBitmapToBase64(bitmap);
        }

        else{
            //set imageView
            imageView.setImageBitmap(result);

            Log.d("VOLLEY_REQUEST", "Setting up volley request...");
            convertBitmapToBase64(result);
        }

        //finally, release the detector
        Log.d("DETECTOR_RELEASE","Releasing detector...");
        detector.release();
    }

    private void convertBitmapToBase64(Bitmap result){
        //---------------Converting cropped image to Base64 string------------------------------
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        if(result!=null){
            result.compress(Bitmap.CompressFormat.JPEG, 100, byteArrayOutputStream);
            base64String = Base64.encodeToString(byteArrayOutputStream.toByteArray(), Base64.DEFAULT);
            Log.d("BASE_64_STRING", base64String);
            //setUpVolleyRequest(base64String, 2);
            Log.d("B64_done", "SET BASE 64 STRING");
        }
        else{
            Log.d("NULL", "NULL bitmap");
        }
        //--------------------------------------------------------------------------------------
    }

    private void setUpVolleyRequest(final String encoded_base64_str, final int detected_emotion) {
        Log.d("VOLLEY","Setting up request...");

        final ProgressDialog dialog = new ProgressDialog(MainActivity.this);
        dialog.setMessage(String.valueOf("Please wait, the face is being evaluated..."));
        dialog.show();

        JSONObject data = new JSONObject();
        try {
            data.put("base64string", base64String);
            data.put("emotion", String.valueOf(emotion));
            data.put("smiling_probability", String.valueOf(smilingProbability));

            Log.d("JSON_OBJ", "Created JSON object... Sending up");

            Log.d("base64 : ", data.getString("base64string"));
            Log.d("emotion : ", data.getString("emotion"));
            Log.d("smiling? : ", data.getString("smiling_probability"));


        }catch(JSONException e){
            Log.d("BAD_JSON", "Bad JSON format");
        }

        JsonObjectRequest request = new JsonObjectRequest(
                Request.Method.POST,
                URL,
                data,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        dialog.cancel();
                        time_end = System.currentTimeMillis();
                        Log.d(":: RESPONSE ::", response.toString());
                        Log.d(":: RESPONSE_TIME::", String.valueOf(time_end - time_start)+" ms");
                        try {
                            String s_response = response.getString("Result");
                            if("OK".equals(s_response)){
                                Log.d("YES!", "Got an OK!");

                                Iterator<String> responseIterator = response.keys();
                                int k = 0;
                                while(responseIterator.hasNext()){
                                    Log.d("KEY_"+k, responseIterator.next());
                                    k++;
                                }

                                //dialog.cancel();
                                Toast.makeText(MainActivity.this, "Received response with ID "+response.getString("id"), Toast.LENGTH_LONG).show();
                                Intent i = new Intent(MainActivity.this, OnJsonResponseReceived.class);
                                i.putExtra("json", response.toString());
                                startActivity(i);
                            }
                            //simply print data
                            //Toast.makeText(MainActivity.this, response.toString(), Toast.LENGTH_LONG).show();
                        }catch(JSONException e){
                            e.printStackTrace();
                        }
                    }
                },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        dialog.cancel();

                        time_end = System.currentTimeMillis();
                        Log.d(":: RESPONSE_TIME::", String.valueOf(time_end - time_start)+" ms");

                        String err = (error.getMessage() == null)?"some error occurred...":error.getMessage();
                        Log.d(" :: ERROR :: ", err);

                        //restart activity
                        Intent intent = getIntent();
                        finish();
                        startActivity(intent);
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

        //CustomRequest jsObjRequest = new CustomRequest(Method.POST, url, params,
        // this.createRequestSuccessListener(), this.createRequestErrorListener());

        request.setRetryPolicy(new DefaultRetryPolicy(DefaultRetryPolicy.DEFAULT_TIMEOUT_MS * 10, 2,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        RequestQueue queue = Volley.newRequestQueue(MainActivity.this);
        queue.add(request);

        Toast.makeText(MainActivity.this, "Request creation successful. Sending to server...", Toast.LENGTH_SHORT).show();

        //start timer
        time_start = System.currentTimeMillis();
    }
}
