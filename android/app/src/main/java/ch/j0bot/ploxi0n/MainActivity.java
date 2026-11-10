package ch.j0bot.ploxi0n;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

/*
 * ploxi0n sur Android (0.99.32). Le plugin de l'app (PloxiAccueil : ploxion comme écran d'accueil, les applis du téléphone) s'enregistre
 * avant super.onCreate, comme Capacitor le demande. Quand ploxion EST l'écran d'accueil, le bouton maison d'Android renvoie un intent
 * HOME à l'activité déjà ouverte : on le dit au JS (window « ploxiAccueil »), qui revient à l'accueil du xer.
 */
public class MainActivity extends BridgeActivity {
    private boolean pret = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PloxiAccueil.class);
        registerPlugin(PloxiBLE.class);   // 〰 (0.99.41) Proche en Bluetooth, comme sur l'iPhone
        super.onCreate(savedInstanceState);
        pret = true;
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        if (pret && bridge != null && intent != null && intent.hasCategory(Intent.CATEGORY_HOME)) {
            bridge.triggerWindowJSEvent("ploxiAccueil");
        }
    }
}
