package kulhalli.rahul.moodometer_v10;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.widget.TextView;

public class OnJsonResponseReceived extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_on_json_response_received);

        final TextView happyText = (TextView) findViewById(R.id.res_happy_str);
        final TextView neutralText = (TextView) findViewById(R.id.res_neutral_str);
        final TextView sadText = (TextView) findViewById(R.id.res_sad_str);

        //get incoming json
        Bundle data = getIntent().getExtras();
        if(data!=null){
            String happy_percent = data.getString("happy");
            String sad_percent = data.getString("sad");
            String neutral_percent = data.getString("neutral");

            happyText.setText(happy_percent);
            sadText.setText(sad_percent);
            neutralText.setText(neutral_percent);
        }
        happyText.setText(String.valueOf("NULL"));
        sadText.setText(String.valueOf("NULL"));
        neutralText.setText(String.valueOf("NULL"));
    }
}
