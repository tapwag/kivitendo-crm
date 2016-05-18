#!/bin/bash
set +e


## Memo und Script zur Installation von kivitendo unter Ubuntu 14.04 (LTS)
echo "Pakete installieren"

echo "deb http://us.archive.ubuntu.com/ubuntu/ trusty multiverse" >> /etc/apt/sources.list
echo "deb-src http://us.archive.ubuntu.com/ubuntu/ trusty multiverse" >> /etc/apt/sources.list
echo "deb http://us.archive.ubuntu.com/ubuntu/ trusty-updates multiverse" >> /etc/apt/sources.list
echo "deb-src http://us.archive.ubuntu.com/ubuntu/ trusty-updates multiverse" >> /etc/apt/sources.list


apt-get update && apt-get upgrade &
apt-get install make gcc apache2 libapache2-mod-fastcgi libarchive-zip-perl libclone-perl libconfig-std-perl libdatetime-perl libdbd-pg-perl libdbi-perl libemail-address-perl libemail-mime-perl libfcgi-perl libjson-perl liblist-moreutils-perl libnet-smtp-ssl-perl libnet-sslglue-perl libparams-validate-perl libpdf-api2-perl librose-db-object-perl librose-db-perl librose-object-perl libsort-naturally-perl libstring-shellquote-perl libtemplate-perl libtext-csv-xs-perl libtext-iconv-perl liburi-perl libxml-writer-perl libyaml-perl libfile-copy-recursive-perl libgd-gd2-perl libimage-info-perl postgresql-9.3 git perl-doc libapache2-mod-php5 php5-gd php5-imap php-mail php-mail-mime php-pear php-mdb2 php-mdb2-driver-pgsql php-fpdf libfpdi-php imagemagick ttf-freefont php5-curl libphp-jpgraph dialog php5-enchant aspell-de &

install CPAN &
reload cpan &
cpan HTML::Restrict &
pear install  Contact_Vcard_Build Contact_Vcard_Parse &

dialog --title "LaTeX installieren" --backtitle "kivitendo installieren" --yesno ". LaTeX bietet eine verbesserte Ausgabe von Druckdokumenten und ist optional, da Dokumente auch in HTML ausgeben werden koennen. Die Installation dauert aber ein wenig. Möchten Sie Latex installieren?" 12 60


response=$?
case $response in
   0) echo "LaTex wird installiert."
      apt-get install texlive-base-bin texlive-latex-recommended texlive-fonts-recommended texlive-latex-extra texlive-lang-german texlive-generic-extra
      ;;
   1) echo "LaTex wird nicht installiert."
      ;;
esac

##Dialog Passwd
dialog --clear --title "Dialog Password" --backtitle "kivitendo installieren" --inputbox "Achtung, Password in Beispieldatenbank bleibt unverändert. (kivitendo)" 10 50 2>/tmp/kivitendo_passwd.$$ kivitendo
PASSWD=`cat /tmp/kivitendo_passwd.$$`

##Dialog Directory
DIR=/var/www/html
dialog --clear --title "Dialog Installationsverzeichnis" --backtitle "kivitendo installieren" --inputbox "Pfad ohne abschliessenden Slash eingenben" 10 50 2>/tmp/kivitendo_dir.$$ /var/www
DIR=`cat /tmp/kivitendo_dir.$$`
rm -f /tmp/kivitendo*

cd $DIR
git clone https://github.com/kivitendo/kivitendo-erp.git
git clone https://github.com/kivitendo/kivitendo-crm.git


echo "Virtuellen Host anlegen"
if [ -f /etc/apache2/sites-available/kivitendeo.apache2.conf ]; then
    echo "Lösche vorherigen Virtuellen Host"
    rm -f /etc/apache2/sites-available/kivitendeo.apache2.conf
fi
touch /etc/apache2/sites-available/kivitendeo.apache2.conf
echo "AddHandler fcgid-script .fpl
AliasMatch ^/kivitendo/[^/]+\.pl $DIR/kivitendo-erp/dispatcher.fcgi
Alias       /kivitendo/          $DIR/kivitendo-erp/

<Directory $DIR/kivitendo-erp>
  AllowOverride All
  Options ExecCGI Includes FollowSymlinks
  DirectoryIndex login.pl
  AddDefaultCharset UTF-8
  Require all granted
</Directory>

<Directory $DIR/kivitendo-erp/users>
  Require all denied
</Directory>

<Directory $DIR/kivitendo-crm>
  AddDefaultCharset UTF-8
  Require all denied
</Directory>

" >>  /etc/apache2/sites-available/kivitendeo.apache2.conf
ln -sf /etc/apache2/sites-available/kivitendeo.apache2.conf /etc/apache2/sites-enabled/kivitendeo.apache2.conf
service apache2 restart

echo "postgres Password ändern"
sudo -u postgres -H -- psql -d template1 -c "ALTER ROLE postgres WITH password '$PASSWD'"

echo "config/kivitendo.conf erzeugen"
cp -f $DIR/kivitendo-erp/config/kivitendo.conf.default $DIR/kivitendo-erp/config/kivitendo.conf

echo "kivitendo.conf bearbeiten"
sed -i "s/admin_password.*$/admin_password = $PASSWD/" $DIR/kivitendo-erp/config/kivitendo.conf
sed -i "s/password =$/password = $PASSWD/" $DIR/kivitendo-erp/config/kivitendo.conf


chown -R www-data: *
cd $DIR/kivitendo-erp/
ln -s ../kivitendo-crm/ crm

##Menü verlinken oder kopieren:
cd $DIR/kivitendo-erp/menus/users
ln -s ../../../kivitendo-crm/menu/10-crm-menu.yaml 10-crm-menu.yaml

##Rechte für CRM ermöglichen:
cd $DIR/kivitendo-erp/sql/Pg-upgrade2-auth
ln -s  ../../../kivitendo-crm/update/add_crm_master_rights.sql add_crm_master_rights.sql

##Übersetzungen anlegen:
cd $DIR/kivitendo-erp/locale/de
mkdir more
ln -s ../../../../kivitendo-crm/menu/t8e/menu.de crm-menu.de
ln -s ../../../../kivitendo-crm/menu/t8e/menu-admin.de crm-menu-admin.de

var=$(git tag | xargs -I@ git log --format=format:"%ai @%n" -1 @ | sort | awk '{print $4,v++,"off"}' | tail -n 8)
_temp="/tmp/answer.$$"

dialog --backtitle "ERP-Version wählen, ESC für Git" --radiolist "Wähle Tag der ausgecheckt werden soll, ESC für aktuelle Git-Version!" 20 50 8 $var 2>$_temp
result=`cat $_temp`

gitlog=$(git log -1 --pretty=oneline --abbrev-commit)

if [ -z "$result" ]; then
     dialog --title "Aktuelle Git" --msgbox "Aktuelle Entwicklerversion:\n$gitlog" 8 66
else
    dialog --title "Ausgewählter Tag" --msgbox "$result wird ausgecheckt!" 6 44
    git checkout $result
fi


dialog --title "Datenbank installieren" --backtitle "kivitendo installieren" --yesno "Möchten Sie die Beispiel-Datenbank für Version 3.2.x installieren?" 7 60
response=$?
case $response in
    0) echo "Datenbank wird installiert."
    sudo -u postgres -H -- createdb kivitendo_auth
    sudo -u postgres -H -- createdb demo-db
    sudo -u postgres -H -- psql kivitendo_auth < $DIR/kivitendo-crm/install/kivitendo_auth.sql
    sudo -u postgres -H -- psql demo-db < $DIR/kivitendo-crm/install/demo-db.sql
    echo "Beim Login: Benutzername: demo, Password: kivitendo"
    echo "***************************************************"
    if [ "$PASSWD" != "kivitendo" ]; then
        echo "Es wurde ein eigenes Passwort vergeben."
        echo "Dieses Passwort muss in der Mandantenkonfiguration eingetragen werden!"
        echo "(http://localhost/kivitendo/admin.pl)"
    fi
    ;;
    1) echo "Datenbank wird nicht installiert."
       ;;
esac



echo "......Installation beendet"
echo ""
echo "kivitendo kann jetzt im Browser unter http://localhost/kivitendo/ aufgerufen werden"
