<?php
    require_once("inc/stdLib.php");
    include("inc/template.inc");
    include("inc/FirmenLib.php");
    include_once("inc/UserLib.php");
    $Q=($_GET["Q"])?$_GET["Q"]:$_POST["Q"];
    $t = new Template($base);
    doHeader($t);
    $t->set_file(array("fa1" => "firmen3.tpl"));
    if (varExist($_POST, "saveneu")) {
            $_POST["customernumber"]=false;
            $_POST["vendornumber"]=false;
        $rc=saveNeuFirmaStamm($_POST,$_FILES,$Q);
        if ($rc[0]>0) { header("location:firmen3.php?Q=$Q&id=".$rc[0]."&edit=1");}
        else { $msg="Fehler beim Sichern (".($rc[1]).")"; };
        $btn1=""; $btn2=""; $_POST["id"]="";
        vartpl ($t,$_POST,$Q,$msg,$btn1,$btn2,3);
    } else if (varExist($_POST, "save")) {
        if ($_POST["id"]) {
            $tabelle=($Q=="C")?"customer":"vendor";
            if (chkTimeStamp($tabelle,$_POST["id"],$_POST["mtime"])) {
                $rc=saveFirmaStamm($_POST,$_FILES,$Q);
                if ($rc[0]>0) {
                    $msg="Daten gesichert.";
                    $_POST=getFirmenStamm($rc[0],false,$Q);
                } else {
                    $msg="Fehler beim Sichern ( ".$rc[1]." )";
                };
            } else {
                $msg="Daten wurden inzwischen modifiert";
                $rc[0]=-1;
            }
        } else {
            $rc[0]=-1; $rc[1]="Kein Bestandskunde";
        }
        $btn1="<input id='bsav' type='submit' class='sichern' name='save' value='sichern' tabindex='90'>&nbsp;";
        $btn2="<input id='banz' type='submit' class='anzeige' name='show' value='zur Anzeige' tabindex='91'>&nbsp;";
        vartpl ($t,$_POST,$Q,$msg,$btn1,$btn2,3);
    } else if ($_POST["show"]) {
        header("location:firma1.php?Q=$Q&id=".$_POST["id"]);
    } else if ($_GET["edit"]) {
        $daten=getFirmenStamm($_GET["id"],false,$Q);
        $msg="Edit: <b>".$_GET["id"]."</b>";
        $btn1="<input id='bsav' type='submit' class='sichern' name='save' value='sichern' tabindex='90'>&nbsp;";
        $btn2="<input id='banz' type='submit' class='anzeige' name='show' value='zur Anzeige' tabindex='91'>&nbsp;";
        vartpl ($t,$daten,$Q,$msg,$btn1,$btn2,3);
    } else {
        leertpl($t,3,$_GET,"Neueingabe");
    }
        $t->Lpparse("out",array("fa1"),$_SESSION['countrycode'],"firma");
?>
