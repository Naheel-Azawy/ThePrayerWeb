const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;
const WebKit2 = imports.gi.WebKit2;
const Notify = imports.gi.Notify;
const GdkPixbuf = imports.gi.GdkPixbuf;
const GLib = imports.gi.GLib;

let dir = GLib.get_current_dir();
let micon = GdkPixbuf.Pixbuf.new_from_file(dir.replace('gjs', 'res') + '/ic_launcher.png');

Gtk.init(null);

let mwindow = new Gtk.Window({
    default_width: 300,
    default_height: 370,
    resizable: false
});
mwindow.set_icon(micon);

let web_view = new WebKit2.WebView();
web_view.load_uri('file:///' + dir.replace('gjs', 'web') + '/index.html');
web_view.zoom_level = 1.1;
//web_view.get_settings().enable_write_console_messages_to_stdout = true;
web_view.connect('load_changed', function (web_view, load_event) {
    if (load_event == WebKit2.LoadEvent.FINISHED)
        mwindow.title = web_view.title;
});
web_view.connect('script_dialog', function (web_view, dialog) {
    var arr = dialog.get_message().split("\n");
    send_notif(arr[0], arr[1], arr[2]);
    return true;
});

mwindow.add(web_view);
mwindow.show_all();
mwindow.connect('destroy', function() { Gtk.main_quit() });

Gtk.main();



function send_notif (name, title, msg) {
    Notify.init(name);
    let notification = new Notify.Notification({
        body: msg,
        summary: title,
    });
	notification.set_image_from_pixbuf(micon);
	notification.show();
}
