<?
// $Id$
session_start();
$filetype=array("rtf","tex","odt","swf");
if ($_POST["erzeugen"]) {
    if (!empty($_FILES["datei"]["name"])) {
        $typ=strtolower(substr($_FILES["datei"]["name"],-3));
        if (in_array($typ,$filetype)) {
            copy($_FILES["datei"]["tmp_name"],"vorlage/".$_FILES["datei"]["name"]);
            unlink ($_FILES["datei"]["tmp_name"]);
            $savefiledir="serbrief/".substr($_FILES["datei"]["name"],0,-4);
            @mkdir($savefiledir);
            $_SESSION["SUBJECT"]=$_POST["SUBJECT"];
            $_SESSION["BODY"]=$_POST["body"];
            $_SESSION["DATE"]=$_POST["date"];
            $_SESSION["savefiledir"]=$savefiledir;
            $_SESSION["datei"]=$_FILES["datei"]["name"];
            $js="f1=open('mkserdocs.php','SerDoc','width=600,height=100')";
            $display="hidden";
        } else {
            $js="alert('Ungültiger Dateityp')";
        }
    } else {
        $js="alert('Bitte einen Dateinamen angeben')";
    }
} 
?>
Daten f&uuml;r den Serienbrief:<br />
<form name="serdoc" action="serdoc.php" enctype='multipart/form-data' method="post">
<INPUT TYPE="hidden" name="MAX_FILE_SIZE" value="5000000">
Datum: <input type="text" name="date" size="12" value="<?= $_POST["date"] ?>"><br />
Betreff: <input type="text" name="subject" size="30" value="<?= $_POST["subject"] ?>"><br />
Zusatztext:<br />
<textarea name="body" cols="50" rows="8"><?= $_POST["body"] ?></textarea><br />
Datei: <input type="file" name="datei" size="28"><br />
<?= $_FILES["datei"]["name"] ?><br />
<input type="submit" name="erzeugen" value="erzeugen" style="visibility:<?= $display ?>">
</form>
<script language="JavaScript"><?= $js ?></script>
