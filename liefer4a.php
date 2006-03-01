<?
// $Id: liefer4a.php,v 1.4 2005/11/02 10:37:51 hli Exp $
	require_once("inc/stdLib.php");
	include("inc/template.inc");
	include("inc/crmLib.php");
	include("inc/persLib.php");
	include("inc/LieferLib.php");
	$pid=($_GET["pid"])?$_GET["pid"]:$_POST["pid"];
	$fid=($_GET["fid"])?$_GET["fid"]:$_POST["fid"];
	$did=($_GET["did"])?$_GET["did"]:$_POST["did"];
	$datum=date("d.m.Y");
	$zeit=date("H:i");
	$knopf="<input type='submit' name='erstellen' value='Erstellen'>";
	if ($_POST["erstellen"]) {
		$docdata=getDOCvorlage($_POST["docid"]);
		if ($docdata["document"]["applikation"]=="O") {
			include('inc/phpOpenOffice.php');
			$doc = new phpOpenOffice();
		} else if ($docdata["document"]["applikation"]=="R") {
			include('inc/phpRtf.php');
			$doc = new phpRTF();
		}
		$doc->loadDocument("vorlage/".$docdata["document"]["file"]);
		$vars= array();
		if ($docdata["felder"]) foreach($docdata["felder"] as $zeile) {
			$value=$zeile["platzhalter"];
			$name=strtoupper($value);
			$vars[$name] = $_POST[$value];
		}
		$doc->parse($vars);
		$data=$_POST;
		$data["CID"]=($pid)?$pid:$fid;
		$data["CRMUSER"]=$_SESSION["loginCRM"];
		//$doc->download(date("YmdHi").substr($docdata["document"]["file"],0,-4));
		$pre=date("YmdHi");
		$doc->prepsave($pre.substr($docdata["document"]["file"],0,-4));
		insFormDoc($data,$pre.$docdata["document"]["file"]);
		$doc->clean();
		$knopf="Dokument erstellt: <a href='./".$_SESSION["mansel"]."/".$data["CID"]."/".$pre.$docdata["document"]["file"]."'>&lt;shift&gt;+&lt;klick&gt;</a>";
	}
	if (!empty($fid)) {
		$fa=getLieferStamm($fid);
		$name=$fa["name"];
		$plz=$fa["zipcode"];
		$ort=$fa["city"];
		$strasse=$fa["street"];
		if (!empty($pid)){
			$co=getKontaktStamm($pid);
			$department_1=$co["cp_givenname"]." ".$co["cp_name"];
			$art="Firma/Kontakt";
		} else {
			$department_1=$fa["department_1"];
			$art="Firmendokumente";
		}
		$link1="liefer1.php?id=$fid";
		$link2="liefer2.php?fid=$fid";
		$link3="liefer3.php?fid=$fid";
		$link4="liefer4.php?fid=$fid";
	}
	$doc=getDocVorlage($_GET["did"]);
	$t = new Template($base);
	$t->set_file(array("doc" => "liefer4a.tpl"));
	$t->set_var(array(
			FID => $fid,
			PID => $pid,
			Link1 => $link1,
			Link2 => $link2,
			Link3 => $link3,
			Link4 => $link4,
			LInr => $fa["vendornumber"],
			Name => $name,
			DEPARTMENT_1 => $department_1,
			Plz => $plz,
			Ort => $ort,
			Art => $art,
			Beschreibung => $doc["document"]["beschreibung"],
			DOCID => $did ,
			Knopf => $knopf
			));
	$t->set_block("doc","Liste","Block");
	$i=0;
	if ($doc["felder"]) foreach($doc["felder"] as $zeile) {
		$value=$zeile["platzhalter"];
		if ($zeile["laenge"]>60) {
			$rows=floor($zeile["laenge"]/60)+1;
			$input="<textarea cols=60 rows=$rows name='".$zeile["platzhalter"]."'>".${$value}."</textarea>";
		} else {
			$input="<input type='text' name='".$zeile["platzhalter"]."' size='".$zeile["laenge"]."' value='".${$value}."'>";
		}
		$t->set_var(array(
			EINGABE => $input,
			Feldname => $zeile["feldname"]
		));
		$i++;
		$t->parse("Block","Liste",true);
	}
	$t->pparse("out",array("doc"));

?>