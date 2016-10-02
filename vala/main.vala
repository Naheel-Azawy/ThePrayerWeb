// Discontinued. Work with gjs instead
using Gtk;
using WebKit;
using Notify;

public class ValaBrowser : Window {

    private string url;

    private WebView web_view;

    public ValaBrowser () {
	var dir = Environment.get_current_dir();

        this.title = "The Prayer";
        set_default_size (300, 370);
        set_resizable (false);

        try {
	        this.icon = new Gdk.Pixbuf.from_file (@"$(dir.replace ("bin", "res"))/ic_launcher.png");
	    } catch (Error e) {
	        stderr.printf ("Could not load application icon: %s\n", e.message);
	    }

	url = @"file://$(dir.replace ("bin", "web"))/index.html";

        create_widgets ();
        connect_signals ();
    }

    private void create_widgets () {
        this.web_view = new WebView ();
        var scrolled_window = new ScrolledWindow (null, null);
        scrolled_window.set_policy (PolicyType.AUTOMATIC, PolicyType.AUTOMATIC);
        scrolled_window.add (this.web_view);
        add (scrolled_window);
    }

    private void connect_signals () {
        this.destroy.connect (Gtk.main_quit);
        this.web_view.load_changed.connect ((load_event) => {
            this.title = this.web_view.title;
        });
        this.web_view.script_dialog.connect ((dialog) => {
        	var arr = dialog.get_message ().split ("\n");
        	send_notif (arr[0], arr[1], arr[2]);
        	return true;
        });
    }

    public void start () {
        show_all ();
        this.web_view.zoom_level = 1.1f;
        this.web_view.load_uri (url);
    }

    public static int main (string[] args) {
        Gtk.init (ref args);

        var browser = new ValaBrowser ();
        browser.start ();

        Gtk.main ();

        return 0;
    }

    public static void send_notif (string name, string title, string msg) {
    	Notify.init (name);
	try {
		var notification = new Notify.Notification (title, msg, null);
		notification.set_image_from_pixbuf (new Gdk.Pixbuf.from_file ("ic_launcher.png"));
		notification.show ();
	} catch (Error e) {
		error ("Error: %s", e.message);
	}
    }
}
