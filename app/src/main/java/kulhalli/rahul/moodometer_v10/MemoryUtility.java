package kulhalli.rahul.moodometer_v10;

/*
* Class courtesy : www.github.com/mitchross
* */


import android.content.Context;

import java.io.File;

public class MemoryUtility
{
    public static long getTotalInternalMemory(Context context)
    {
        return new File(context.getFilesDir().getAbsoluteFile().toString()).getTotalSpace();
    }

    public static long getTotalUnusedMemory(Context context)
    {
        return new File(context.getFilesDir().getAbsoluteFile().toString()).getFreeSpace();
    }

    public static float getPercentageMemoryFree(Context context)
    {
        long total = getTotalInternalMemory(context);
        long avail = getTotalUnusedMemory(context);
        return ((float)avail / (float)total);
    }
}