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
import java.util.List;

public class OnJsonResponseReceived extends AppCompatActivity {

    private String happy_percent, sad_percent, neutral_percent;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_on_json_response_received);
        final ListView listView = (ListView) findViewById(R.id.listview);


        /*
        * Final response outlay:
        *
        *   {
            "Result": "OK",
             "data": "Processed 1/1 images in 0.778470 seconds ...\n----- Prediction for images/image-3d2423d8-7909-4c23-9701-71b3ff2dc8f9.jpg
             -----\n 99.9705% - \"Neutral\"\n  0.0225% - \"Disgust\"\n  0.0070% - \"Surprise\"\n  0.0001% - \"Fear\"\n  0.0000% - \"Anger\"\n\n
             Script took 2.031076 seconds.\n",
             "id": "5899d912b0522cdfbff28baa"
            }
        *
        * */

        Bundle data = getIntent().getExtras();

        if(data!=null){

            ArrayList<Emotion> list = new ArrayList<>();

            String raw_op = data.getString("op");

            if(raw_op != null){

                Log.d("RAW_OP", raw_op);

                String[] lines = raw_op.split("\n");
                for(String line: lines){
                    if(line.contains("Neutral") || line.contains("Surprise") || line.contains("Fear") || line.contains("Anger") || line.contains("Disgust")
                            || line.contains("Happy") || line.contains("Sad")){
                        //Neutral
                        String[] inner_split = line.split("-");
                        //[0] is %, [1] is emotion
                        double percent = Double.parseDouble(inner_split[0].replace("%","").trim());
                        list.add(new Emotion(inner_split[1].trim(), percent));
                    }
                }
            }

            CustomListAdapter adapter = new CustomListAdapter(OnJsonResponseReceived.this, list);

            listView.setAdapter(adapter);
        }
    }
}
