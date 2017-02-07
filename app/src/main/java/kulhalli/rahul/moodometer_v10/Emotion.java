package kulhalli.rahul.moodometer_v10;

public class Emotion {
    private String key;
    private double value;

    public Emotion(String key, double value){
        this.key = key;
        this.value = value;
    }

    public String getKey() {
        return key;
    }

    public double getValue() {
        return value;
    }
}
