package kulhalli.rahul.moodometer_v10;


import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Adapter;
import android.widget.BaseAdapter;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.Map;

public class CustomListAdapter extends BaseAdapter {

    private LayoutInflater inflater;
    private Context context;
    private ArrayList<Emotion> emotions;

    public CustomListAdapter(Context context, ArrayList<Emotion> data){
        this.context = context;
        this.emotions = data;
        inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
    }

    @Override
    public int getCount() {
        return emotions.size();
    }

    @Override
    public Object getItem(int i) {
        return emotions.get(i);
    }

    @Override
    public long getItemId(int i) {
        return i;
    }

    @Override
    public View getView(int i, View view, ViewGroup viewGroup) {
        View v = inflater.inflate(R.layout.list_layout, viewGroup, false);

        TextView left = (TextView) v.findViewById(R.id.left);
        TextView right = (TextView) v.findViewById(R.id.right);

        Emotion emotion = (Emotion)getItem(i);

        left.setText(emotion.getKey());
        right.setText(String.valueOf(emotion.getValue()));

        return v;
    }
}
