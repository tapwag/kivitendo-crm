<!-- $Id$ -->
<html xmlns="http://www.w3.org/1999/xhtml">
	<head><title>Firma Stamm</title>
	<link type="text/css" REL="stylesheet" HREF="css/main.css"></link>
	<script language="JavaScript" type="text/javascript">
	<!--
		function showItem(id) {
			F1=open("getCall.php?Q=C&fid={FID}&id="+id,"Caller","width=610, height=600, left=100, top=50, scrollbars=yes");
		}
		function anschr(A) {
			if (A==1) {
				F1=open("showAdr.php?fid={FID}","Adresse","width=350, height=400, left=100, top=50, scrollbars=yes");
			} else {
				F1=open("showAdr.php?sid={FID}","Adresse","width=350, height=400, left=100, top=50, scrollbars=yes");
			}
		}
		function notes() {
                                F1=open("showNote.php?fid={FID}","Notes","width=400, height=400, left=100, top=50, scrollbars=yes");
                }
		function vcard(){
			document.location.href="vcardexp.php?fid={FID}";
		}
		function ks() {
			sw=document.ksearch.suchwort.value;
			if (sw != "") 
				F1=open("suchKontakt.php?suchwort="+sw+"&Q=C&id={FID}","Suche","width=400, height=400, left=100, top=50, scrollbars=yes");
			return false;
		}
		var last = 'lie';
		function submenu(id) {
			document.getElementById(last).style.visibility='hidden';
			last=id;
			document.getElementById(id).style.visibility='visible';
		}
	//-->
	</script>
	</head>
<body>
<p class="listtop">Detailansicht</p>
<div style="position:absolute; top:33px; left:8px;  width:770px;">
	<ul id="tabmenue">
	<li><a href="firma1.php?id={FID}" id="aktuell">Kundendaten</a></li>
	<li><a href="firma2.php?fid={FID}">Kontakte</a></li>
	<li><a href="firma3.php?fid={FID}">Ums&auml;tze</a></li>
	<li><a href="firma4.php?fid={FID}">Dokumente</a></li>
	<span title="Wichtige Mitteilung">{Cmsg}&nbsp;</span>
	</ul>
</div>

<span style="position:absolute; left:10px; top:67px; width:95%;">
<!-- Beginn Code --------------------------------------------- -->
<span style="float:left; width:49%; height:410px; text-align:center; border: 1px solid black;">
	<div style="float:left; width:72%; height:165px; text-align:left; border-bottom: 0px solid black; padding:2px;" class="gross">
		{Fname1}<br />
		{Fdepartment_1}<br />
		{Strasse}<br />
		<span class="mini">&nbsp;<br /></span>
		{Land}-{Plz} {Ort}<br />	
		{Fcontact_1}<br />
		Tel: {Telefon}<br />
		Fax: {Fax}<br />	
	</div>
	<div style="float:left; width:25%; height:165px; text-align:right; border-bottom: 0px solid black; padding:2px;" class="gross">
		{KDNR}<br />
		{IMG}<br /><br />
		<a href="#" onCLick="anschr(1);" title="Briefanschrift &amp; Etikett"><img src="image/brief.gif" alt="Etikett drucken" border="0" /></a><br />
			<form action="../oe.pl" method="post">
	  		<input type="hidden" name="path" value="bin/mozilla">
			<input type="hidden" name="login" value="{login}">
			<input type="hidden" name="action" value="add">
			<input type="hidden" name="type" value="sales_order">
			<input type="hidden" name="password" value="{password}">
	  		<input type="hidden" name="customer_id" value="{FID}"><input type="submit" value="Auftrag" title="neuen Auftrag eingeben"></form>
	</div>
	<div style="float:both; width=100%; height:215px; text-align:left; border-bottom: 1px solid black;" class="gross">
		<a href="mail.php?TO={eMail}&KontaktTO=C{FID}">&nbsp;{eMail}</a><br />
		<a href="{Internet}" target="_blank">&nbsp;{Internet}</a>

		<ul id="submenue">
			<li><a href="#" onClick="submenu('lie')">Lieferadresse</a></li>
			<li><a href="#" onClick="submenu('not')">Notizen</a></li>
			<li><a href="#" onClick="submenu('inf')">sont.Infos</a></li>
			<li><a href="firmen3.php?id={FID}&edit=1">Bearbeiten</a></li>
		</ul>
	</div>

	<span id="lie" style="visibility:visibile; position:absolute; text-align:left;width:48%; left:5px; top:245px;" >
		<div class="smal" >
		<br />
		{Sname1} &nbsp;&nbsp;<a href="#" onCLick="anschr(2);"><img src="image/brief.gif" alt="Etikett drucken" border="0" /></a><br />
		{Sdepartment_1}<br />
		{SStrasse}<br />
		<span class="mini">&nbsp;<br /></span>
		{SLand}-{SPlz} {SOrt}<br />
		<span class="mini">&nbsp;<br /></span>
		Tel: {STelefon}<br />
		Fax: {SFax}<br />
		<a href="mail.php?TO={SeMail}&KontaktTO=C{FID}">{SeMail}</a>
		</div>
	</span>

	<span id="not" style="visibility:hidden;position:absolute;  text-align:left;width:48%; left:5px; top:245px;">
		<div class="smal" >
		<br />
		Branche: <span class="value">{branche}</span><br />
		Stichworte: <span class="value">{sw}</span><br />
		Bemerkungen: <span class="value">{notiz}</span> <br />	
		</div>
	</span>	

	<span id="inf" style="visibility:hidden;position:absolute; text-align:left;width:48%; left:5px; top:245px;">
		<div class="smal" >
		Kundentyp: <span class="value">{kdtyp}</span> <br />
		Rabatt: <span class="value">{rabatt}</span> &nbsp;&nbsp;&nbsp; Preisgruppe: <span class="value">{preisgrp}</span><br /><br />
		Steuer-Nr.: <span class="value">{Taxnumber}</span> &nbsp;&nbsp;&nbsp; UStId: <span class="value">{USTID}</span><br /><br />
		Zahlungsziel: <span class="value">{terms}</span> Tage <br />
		Kreditlimit: <span class="value">{kreditlim}</span> &nbsp;&nbsp;&nbsp;OP: <span class="value">{op}</span><br /><br />
		Bankname: <span class="value">{bank}</span><br />
		Blz: <span class="value">{blz}</span> &nbsp;&nbsp;&nbsp; Konto: <span class="value">{konto}</span>
		</div>
	</span>
</span>

<span style="float:left; width:50%; height:410px; text-align:left; border: 1px solid black; border-left:0px;">
<table width="99%" summary="Kontaktverlauf">
<!-- BEGIN Liste -->
	<tr onMouseover="this.bgColor='#FF0000';" onMouseout="this.bgColor='{LineCol}';" bgcolor="{LineCol}" onClick="showItem({IID});">
		<td class="smal" width="100" height="14px">{Datum} {Zeit}</td>
		<td class="smal" width="60">{Nr}</td>
		<td class="smal le">{Betreff}</td>
		<td class="smal le">{Name}</td>
	</tr>
<!-- END Liste -->
</table>
	<span style="position:absolute; bottom:10px;  text-align:left; border:0px solid black">
		<form name="ksearch" onSubmit="return ks();"> &nbsp; 
		<a href="firma1.php?id={FID}&start={PREV}">&lt;</a> 
			<a href="firma1.php?id={FID}&start={PAGER}" class="bold">neu laden</a> 
		<a href="firma1.php?id={FID}&start={NEXT}">&gt; &nbsp;</a>
			<input type="text" name="suchwort" size="20">
			<input type="submit" name="ok" value="suchen">
		</form>
	</span>
</span>
<!-- End Code --------------------------------------------- -->
</span>
</body>
</html>
