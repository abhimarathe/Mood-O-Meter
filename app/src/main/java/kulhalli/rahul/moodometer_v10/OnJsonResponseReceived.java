package kulhalli.rahul.moodometer_v10;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Iterator;

public class OnJsonResponseReceived extends AppCompatActivity {

    private String happy_percent, sad_percent, neutral_percent;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_on_json_response_received);
        final ListView listView = (ListView) findViewById(R.id.listview);

                        /*
                        * This is what the response from the server looks like:
                        *
                        * {
                             "Result": "OK",
                             "disgust": "0.0998%",
                             "fear": "0.2272%",
                             "happy": "99.6460%",
                             "neutral": "0.0246%",
                             "surprise": "0.0011%"
                             "id": "58918d6ab0522c1c87b4f3ef"
                          }
                        *
                        * */

        Bundle data = getIntent().getExtras();

        if(data!=null){

            JSONObject _data = null;

            try{
                String stuff = data.getString("json");
                _data = new JSONObject(stuff);

                Log.d("PARSE_SUCCESS", "Successfully parsed..");

                RelativeLayout layout = (RelativeLayout) findViewById(R.id.activity_on_json_response_received);
                //iterator over keys and create dynamic textviews
                int i = 0;
                Iterator<String> json_keys = _data.keys();
                ArrayList<Emotion> list = new ArrayList<>();
                while(json_keys.hasNext()){
                    String emotion_class = json_keys.next();
                    String class_percent = _data.getString(emotion_class);

                    if(emotion_class.equalsIgnoreCase("id") || emotion_class.equalsIgnoreCase("Result")){
                        //do nothing
                        Log.d("id/Result","Skipping...");
                    }
                    else{
                        list.add(new Emotion(emotion_class, class_percent));
                    }
                }

                CustomListAdapter adapter = new CustomListAdapter(OnJsonResponseReceived.this, list);

                listView.setAdapter(adapter);

            }catch(JSONException e){
                Log.d("BAD_JSON", "Bad JSON Format...");
                e.printStackTrace();
            }
        }
    }
}
