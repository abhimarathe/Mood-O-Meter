package kulhalli.rahul.moodometer_v10;

import android.app.Application;
import android.content.Context;

import org.acra.annotation.*;
import org.acra.*;
import org.acra.sender.HttpSender;


//report format defined here
@ReportsCrashes(
        formUri = "<Server URL>",           //URL of server!
        connectionTimeout = 25000,
        socketTimeout = 25000,
        httpMethod = HttpSender.Method.POST,                //HTTP POST format!
        reportType = HttpSender.Type.JSON,                   //JSON format to be uploaded
        mode = ReportingInteractionMode.TOAST,
        resToastText = R.string.toast_text,
        logcatArguments = { "-t", "150", "-v", "threadtime", "*:D" }
)

public class ApplicationCrashListener extends android.app.Application{
    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);

        ACRA.init(this);
    }
}
