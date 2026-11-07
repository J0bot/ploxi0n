package ch.j0bot.ploxi0n;

import android.app.role.RoleManager;
import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Base64;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.ByteArrayOutputStream;
import java.util.List;

/*
 * ⌂ PloxiAccueil (0.99.32, RS-7 : « sur Android, l'appli ploxion utilisable comme launcher, comme appli de base »).
 *   estAccueil()            → { accueil: bool, peut: bool }   ploxion est-il l'écran d'accueil choisi ?
 *   choisir()               → { accueil: bool }               la fenêtre d'Android pour le choisir (le rôle HOME, Android 10+),
 *                                                             sinon les réglages « appli d'accueil par défaut »
 *   applis({ icones, taille }) → { applis: [{ paquet, nom, icone? }] }   les applis du téléphone qu'on peut lancer
 *   lancer({ paquet })      → {}                              ouvre une appli Android
 *   reglages({ paquet? })   → {}                              les réglages d'une appli (ou d'Android)
 * Rien ne quitte le téléphone : la liste des applis reste dans l'app (ne pas nuire).
 */
@CapacitorPlugin(name = "PloxiAccueil")
public class PloxiAccueil extends Plugin {

    private boolean estAccueil() {
        Intent i = new Intent(Intent.ACTION_MAIN);
        i.addCategory(Intent.CATEGORY_HOME);
        ResolveInfo r = getContext().getPackageManager().resolveActivity(i, PackageManager.MATCH_DEFAULT_ONLY);
        return r != null && r.activityInfo != null && getContext().getPackageName().equals(r.activityInfo.packageName);
    }

    @PluginMethod
    public void estAccueil(PluginCall call) {
        JSObject o = new JSObject();
        o.put("accueil", estAccueil());
        o.put("peut", true);
        call.resolve(o);
    }

    @PluginMethod
    public void choisir(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            RoleManager rm = getContext().getSystemService(RoleManager.class);
            if (rm != null && rm.isRoleAvailable(RoleManager.ROLE_HOME) && !rm.isRoleHeld(RoleManager.ROLE_HOME)) {
                startActivityForResult(call, rm.createRequestRoleIntent(RoleManager.ROLE_HOME), "apresChoix");
                return;
            }
        }
        try {
            Intent i = new Intent(Settings.ACTION_HOME_SETTINGS);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
        } catch (Exception e) {
            Intent i = new Intent(Settings.ACTION_SETTINGS);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
        }
        JSObject o = new JSObject();
        o.put("accueil", estAccueil());
        call.resolve(o);
    }

    @ActivityCallback
    private void apresChoix(PluginCall call, ActivityResult result) {
        if (call == null) return;
        JSObject o = new JSObject();
        o.put("accueil", estAccueil());
        call.resolve(o);
    }

    @PluginMethod
    public void applis(PluginCall call) {
        boolean icones = call.getBoolean("icones", true);
        int taille = Math.max(24, Math.min(192, call.getInt("taille", 96)));
        PackageManager pm = getContext().getPackageManager();
        Intent i = new Intent(Intent.ACTION_MAIN);
        i.addCategory(Intent.CATEGORY_LAUNCHER);
        List<ResolveInfo> l = pm.queryIntentActivities(i, 0);
        String moi = getContext().getPackageName();
        JSArray a = new JSArray();
        for (ResolveInfo r : l) {
            if (r.activityInfo == null || moi.equals(r.activityInfo.packageName)) continue;
            JSObject o = new JSObject();
            o.put("paquet", r.activityInfo.packageName);
            o.put("activite", r.activityInfo.name);
            CharSequence nom = r.loadLabel(pm);
            o.put("nom", nom == null ? r.activityInfo.packageName : nom.toString());
            if (icones) {
                try {
                    o.put("icone", "data:image/png;base64," + png(r.loadIcon(pm), taille));
                } catch (Exception e) {
                    /* une icône illisible : l'appli reste dans la liste, sans icône */
                }
            }
            a.put(o);
        }
        JSObject res = new JSObject();
        res.put("applis", a);
        call.resolve(res);
    }

    private static String png(Drawable d, int taille) {
        Bitmap b = Bitmap.createBitmap(taille, taille, Bitmap.Config.ARGB_8888);
        Canvas c = new Canvas(b);
        d.setBounds(0, 0, taille, taille);
        d.draw(c);
        ByteArrayOutputStream s = new ByteArrayOutputStream();
        b.compress(Bitmap.CompressFormat.PNG, 100, s);
        b.recycle();
        return Base64.encodeToString(s.toByteArray(), Base64.NO_WRAP);
    }

    @PluginMethod
    public void lancer(PluginCall call) {
        String paquet = call.getString("paquet");
        String activite = call.getString("activite");
        if (paquet == null || paquet.isEmpty()) {
            call.reject("paquet manquant");
            return;
        }
        Intent i = null;
        if (activite != null && !activite.isEmpty()) {
            i = new Intent(Intent.ACTION_MAIN);
            i.addCategory(Intent.CATEGORY_LAUNCHER);
            i.setComponent(new ComponentName(paquet, activite));
        } else {
            i = getContext().getPackageManager().getLaunchIntentForPackage(paquet);
        }
        if (i == null) {
            call.reject("appli introuvable : " + paquet);
            return;
        }
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);
        try {
            getContext().startActivity(i);
            call.resolve();
        } catch (Exception e) {
            call.reject("impossible d'ouvrir " + paquet, e);
        }
    }

    @PluginMethod
    public void reglages(PluginCall call) {
        String paquet = call.getString("paquet");
        Intent i = paquet == null || paquet.isEmpty()
            ? new Intent(Settings.ACTION_SETTINGS)
            : new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + paquet));
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(i);
            call.resolve();
        } catch (Exception e) {
            call.reject("réglages indisponibles", e);
        }
    }
}
