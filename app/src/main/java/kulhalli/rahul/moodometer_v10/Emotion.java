package kulhalli.rahul.moodometer_v10;

public class Emotion {
    private String key;
    private String value;

    public Emotion(String key, String value){
        this.key = key;
        this.value = value;
    }

    public String getKey() {
        return key;
    }

    public String getValue() {
        return value;
    }
}
