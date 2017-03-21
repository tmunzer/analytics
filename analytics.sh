#!/bin/bash
# =========================================================
# =========================================================
#
#            APP CONTAINER CREATION
#            SPECIFIC TO EACH APP
#            !!! DO NOT CHANGE !!!
#
# =========================================================
# =========================================================
function create_app_container
{
    echo ""
    if [ `$DOCKER ps -a | grep $APP_NAME | wc -l` -eq 0 ]
    then
      echo -e "${INFOC}INFO${NC}: $APP_NAME container not present. Creating it..."
      $DOCKER create \
      --security-opt label:disable \
      -v $PERSISTANT_FOLDER/$APP_NAME/config.js:/app/config.js:ro \
      --link $DB_NAME:mongo \
      --name="$APP_NAME" \
      --restart="on-failure:5" \
      --memory=128m \
      -e "VIRTUAL_HOST=$NODEJS_VHOST" \
      -e "LETSENCRYPT_HOST=$NODEJS_VHOST" \
      -e "LETSENCRYPT_EMAIL=$LETSENCRYPT_EMAIL" \
      $APP_IMG
	if [ $? -eq 0 ]
	then
	    echo -e "${INFOC}INFO${NC}: $APP_NAME container is now created."
	else
	    echo -e "${ERRORC}ERROR${NC}: $APP_NAME container can't be created."
	fi
    else
	echo -e "${INFOC}INFO${NC}: $APP_NAME image is already created."
    fi
}
# =========================================================
# =========================================================
#
#            SYSTEM PARAMETERS
#            DO NOT CHANGE!!!
#
# =========================================================
# =========================================================
SCRIPT_CONF=`pwd`"/ah-ref-app.conf"
SCRIPT_NAME="analytics"

APP_NAME="analytics"
APP_IMG="tmunzer/analytics"
OAUTH_CALLBACK="/oauth/reg"

LETSENCRYPT_ENABLE=true
LETSENCRYPT_EMAIL=""

# =========================================================
# Email server configuration
# true if email server is needed by the App
EMAIL_SRV_ENABLE=false

# =========================================================
# mongoDB server configuration
# uncomment if needed by the app
DB_FOLDER="mongoDB"
DB_NAME="ah-mongo"
DB_IMG="mongo"

# =========================================================
# NGINX server configuration
# true if email server is needed by the App

NGINX_CERTS_FOLDER="certs"
NGINX_NAME="ah-proxy"
NGINX_IMG="jwilder/nginx-proxy"

LETSENCRYPT_NAME="ah-letsencrypt"
LETSENCRYPT_IMG="jrcs/letsencrypt-nginx-proxy-companion"

DOCKER=""

# =========================================================
# Colors
INFOC='\033[0;32m'
WARNINGC='\033[0;33m'
ERRORC='\033[0;31m'
NC='\033[0m' # No Color


################################################################################
############################    BANNER
################################################################################
function banner
{
  echo ""
  echo "||============================================================================="
  echo "||"
  echo "||       $1"
  echo "||"
  echo "||============================================================================="
}

################################################################################
############################    SCRIPT CONF
################################################################################

function script_conf
{
  # FOLDER PARAMETERS
  echo "We will need a persistant folder to store application configuration, data and certificates."
  echo "Where do you want to store these data? [$PERSISTANT_FOLDER]"
  echo ""
  response=""
  while ! echo $response | grep -i "y" > /dev/null
  do
    read -p "PERSISTANT FOLDER: " PERSISTANT_FOLDER
    if ! echo $PERSISTANT_FOLDER | grep ^"/" > /dev/null
    then
      echo -e "${WARNINGC}WARNING${NC}: Incorrect input"
    else
      read -p "Is \"$PERSISTANT_FOLDER\" correct (y/n)? " response
    fi
  done
  while [ ! -d "$PERSISTANT_FOLDER" ]
  do
    echo "$PERSISTANT_FOLDER does not exist."
    create=""
    while ! echo $create | grep -i "[ny]" > /dev/null
    do
      read -p "Do you want to create it (y/n)? " create
      case $create in
        "y"|"Y") mkdir -p "$PERSISTANT_FOLDER/$APP_NAME";;
        *) exit 0;;
      esac
    done
  done
  # LETS ENCRYPT PARAMETERS
  response=""
  while ! echo $response | grep -i "[yn]" > /dev/null
  do
    echo ""
    echo "Do you want to use Let's Encrypt service (https://letsencrypt.org) to have free trusted HTTPS certificates (Let's Encrypt services has to be able to resolv the Application DNS entry and to reach the docker container on TCP80 and TCP443)?"
    echo ""
    echo -e "${WARNINGC}WARNING${NC}: Be carreful, some domain names may be blacklisted by Let's Encrypt service. "
    echo "         This seems to be the case for Microsft and Amazon Web Services."
    echo "         In this case, you will not be able to use the given FQDN, but you will have to"
    echo "         use a custom FQDN and create a CNAME DNS entry."
    echo ""
    read -p "Use Let's Encrypt Service (y/n)? " response
    case $response in
      "y"|"Y")
        LETSENCRYPT_ENABLE=true;
        read -p "Let's Encrypt contact email address: " LETSENCRYPT_EMAIL;
        ;;
      "n"|"N") LETSENCRYPT_ENABLE=false;;
    esac
  done
  # VHOST PARAMETER
  echo ""
  echo ""

  # SAVING PARAMETERS
  if [ -f $SCRIPT_CONF ]
  then
    mv $SCRIPT_CONF $SCRIPT_CONF.bak
  fi
  touch $SCRIPT_CONF
  while read line
  do
    if echo "$line" | grep "VHOST" > /dev/null
    then
      echo "$line" >> $SCRIPT_CONF
    fi
  done < $SCRIPT_CONF.bak
  echo "" >> $SCRIPT_CONF
  echo "PERSISTANT_FOLDER=$PERSISTANT_FOLDER" >> $SCRIPT_CONF
  echo "LETSENCRYPT_ENABLE=$LETSENCRYPT_ENABLE" >> $SCRIPT_CONF
  echo "LETSENCRYPT_EMAIL=$LETSENCRYPT_EMAIL" >> $SCRIPT_CONF
  echo "" >> $SCRIPT_CONF


}

function update_vhost
{
  echo "To use the NGINX reverse proxy, we will need a dedicated DNS entry for the application."
  echo "Web browsers will access the application interface from this FQDN."
  response=""
  while ! echo $response | grep -i "y" > /dev/null
  do
    read -p "Application DNS name: " NODEJS_VHOST
    read -p "Are you sure (y/n)? " response
  done
  echo "$APP_NAME-NODEJS_VHOST=$NODEJS_VHOST" >> $SCRIPT_CONF
  echo "" >> $SCRIPT_CONF
}

function init_script_conf
{
  if [ ! -f "$SCRIPT_CONF" ]
  then
    echo "-----=============-----"
    echo "--=== SCRIPT INIT ===--"
    echo ""
    echo "Before starting, here are some questions..."
    echo ""
    script_conf
    response=""
    while ! echo $response | grep -i "[y]" > /dev/null
    do
      echo ""
      echo "Current parameters:"
      echo ""
      cat $SCRIPT_CONF
      read -p "Is the configuration correct (y/n)? " response
      case $response in
        "n"|"N") script_conf;;
      esac
    done
  else
    while read line
    do
      if echo $line | grep "PERSISTANT_FOLDER" > /dev/null
      then
        PERSISTANT_FOLDER=`echo "$line" | cut -d"=" -f2`
      fi
      if echo $line | grep "$APP_NAME-NODEJS_VHOST" > /dev/null
      then
        NODEJS_VHOST=`echo "$line" | cut -d"=" -f2`
      fi
      if echo $line | grep "LETSENCRYPT_ENABLE" > /dev/null
      then
        LETSENCRYPT_ENABLE=`echo "$line" | cut -d"=" -f2`
      fi
      if echo $line | grep "LETSENCRYPT_EMAIL" > /dev/null
      then
        LETSENCRYPT_EMAIL=`echo "$line" | cut -d"=" -f2`
      fi
    done < $SCRIPT_CONF
  fi
  if echo "$PERSISTANT_FOLDER" | grep -i [a-z] > /dev/null
  then
    DB_FOLDER="$PERSISTANT_FOLDER/$DB_FOLDER"
    NGINX_CERTS_FOLDER="$PERSISTANT_FOLDER/$NGINX_CERTS_FOLDER"
    echo -e "${INFOC}INFO${NC}: Script configuration loaded succesfully."
  else
    echo -e "${ERRORC}ERROR${NC}: not able to load Script configuration. Exiting..."
    exit 254
  fi
  if [ ! "$NODEJS_VHOST" ]
  then
    update_vhost
    update_acs
  fi
}

function read_script_conf
{
  if [ ! -f $SCRIPT_CONF ]
  then
    echo -e "${WARNINGC}WARNING${NC}: Script configuration file does not exists..."
    script_conf
  fi
  echo ""
  echo "Current parameters:"
  echo ""
  cat $SCRIPT_CONF
}

function menu_script
{
  response=""
  while ! echo $response | grep -i "[b]" > /dev/null
  do
    echo ""
    echo "1) Change Script parameters"
    echo "2) View Script parameters"
    echo "b) Back"
    echo "Please make a choice"
    read response
    case $response in
      "1") script_conf;;
      "2") read_script_conf;;
      "b") menu_main;;
    esac
  done
}

################################################################################
############################    ACS CONF
################################################################################

function save_acs
{

  if [ -f "$PERSISTANT_FOLDER/$APP_NAME/config.js" ]
  then
    mv $PERSISTANT_FOLDER/$APP_NAME/config.js $PERSISTANT_FOLDER/$APP_NAME/config.js.bak
    if [ $? -eq 0 ]
    then
      echo -e "${INFOC}INFO${NC}: old configuration file backed up at $PERSISTANT_FOLDER/$APP_NAME/config.js.bak"
    else
      echo -e "${ERRORC}ERROR${NC}: can't backup old configuration file."
    fi
  fi


  touch $PERSISTANT_FOLDER/$APP_NAME/config.js
  echo "module.exports.appServer = {" >> $PERSISTANT_FOLDER/$APP_NAME/config.js
  echo "  vhost: \"$NODEJS_VHOST\"" >> $PERSISTANT_FOLDER/$APP_NAME/config.js
  echo "};" >> $PERSISTANT_FOLDER/$APP_NAME/config.js
  echo "module.exports.devAccount = {" >> $PERSISTANT_FOLDER/$APP_NAME/config.js
  if echo $OAUTH_CALLBACK | grep "^/" > /dev/null
  then
    echo "  redirectUrl: \"https://$NODEJS_VHOST$OAUTH_CALLBACK\"," >> $PERSISTANT_FOLDER/$APP_NAME/config.js
  else
    echo "  redirectUrl: \"https://$NODEJS_VHOST/$OAUTH_CALLBACK\"," >> $PERSISTANT_FOLDER/$APP_NAME/config.js
  fi
  echo "  clientSecret: \"$CLIENTSECRET\"," >> $PERSISTANT_FOLDER/$APP_NAME/config.js
  echo "  clientID: \"$CLIENTID\"" >> $PERSISTANT_FOLDER/$APP_NAME/config.js
  echo "}" >> $PERSISTANT_FOLDER/$APP_NAME/config.js
  if [ "$DB_NAME" ]
  then
    echo "module.exports.mongoConfig = {" >> $PERSISTANT_FOLDER/$APP_NAME/config.js
    echo "  host: \"mongo\",base: \"$APP_NAME\"" >> $PERSISTANT_FOLDER/$APP_NAME/config.js
    echo "}" >> $PERSISTANT_FOLDER/$APP_NAME/config.js
  fi
  echo ""  >> $PERSISTANT_FOLDER/$APP_NAME/config.js

  if [ `$DOCKER ps | grep -c "$APP_NAME"` -eq 1 ]
  then
    echo ""
    echo -e "${WARNINGC}WARNING${NC}: $APP_NAME is running."
    echo "Do you want to recreate the container to use the new configuration?"
    response=""
    while ! echo $response | grep -i "[ny]" > /dev/null
    do
      read -p "Recreate (y/n)? " response
      case $response in
        "Y"|"y")
            $DOCKER rm -f $APP_NAME > /dev/null
            if [ $? -gt 0 ]
            then
              echo -e "${ERRORC}ERROR${NC}: Unable to remove old container."
              echo "       You will have to manually remove it to use the new configuration."
            else
              echo -e "${INFOC}INFO${NC}: $APP_NAME container removed."
              start_container $APP_NAME
            fi
            ;;
        *);;
      esac
    done
  elif [ `$DOCKER ps -a | grep -c "$APP_NAME"` -eq 1 ]
  then
    $DOCKER rm $APP_NAME > /dev/null
    if [ $? -gt 0 ]
    then
      echo -e "${ERRORC}ERROR${NC}: Unable to remove old container."
      echo "       You will have to manually remove it to use the new configuration."
    fi
  fi
}

function update_acs
{
  if [ -f "$PERSISTANT_FOLDER/$APP_NAME/config.js" ]
  then
    echo -e "${INFOC}INFO${NC}: Updating ACS configuration with new hostname."
    while read line
    do
      if echo $line | grep "clientSecret:" > /dev/null
      then
        CLIENTSECRET=`echo "$line" | grep -o "clientSecret:.*\"[^\"]*" | cut -d"\"" -f2`
      fi
      if echo $line | grep "clientID:" > /dev/null
      then
        CLIENTID=`echo "$line" | grep -o "clientID:.*\"[^\"]*" | cut -d"\"" -f2`
      fi
    done < $PERSISTANT_FOLDER/$APP_NAME/config.js
    save_acs
  fi
}

function acs_conf
{
  correct="n"
  while ! echo $correct | grep -i "y" > /dev/null
  do
    echo "To use this APP, you will need an account on the Aerohive Developer portal."
    echo "If you don't have any account for now, please go to https://developer.aerohive.com/ and create one."
    echo "Otherwise, you can continue and configure the ACS parameters"
    echo ""
    response=""
  	while ! echo $response | grep -i "[ny]" > /dev/null
  	do
  	  echo -n "Continue (y/n)? "
  	  read response
      case $response in
  		  "N"|"n") exit 0;;
  		  *);;
  	  esac
  	done
    read -p "ClientID (from dev portal): " CLIENTID
    read -p "ClientSecret (from dev portal): " CLIENTSECRET
    echo ""
    echo "PARAMETERS:"
    echo "ClientID: $CLIENTID"
    echo "ClientSecret: $CLIENTSECRET"
    if echo $OAUTH_CALLBACK | grep "^/" > /dev/null
    then
      echo "RedirectURL: https://$NODEJS_VHOST$OAUTH_CALLBACK"
    else
      echo "RedirectURL: https://$NODEJS_VHOST/$OAUTH_CALLBACK"
    fi
    echo ""
    read -p "Is this correct (y/n)? " correct
  done
  touch $PERSISTANT_FOLDER/$APP_NAME/config.js
  if [ $? -eq 0 ]
  then
    echo -e "${INFOC}INFO${NC}: new configuration file saved at $PERSISTANT_FOLDER/$APP_NAME/config.js"
  else
    echo -e "${ERRORC}ERROR${NC}: can't save new configuration file."
  fi

  save_acs
}

function init_acs_conf
{
  if [ ! -f "$PERSISTANT_FOLDER/$APP_NAME/config.js" ]
  then
    acs_conf
  else
    echo -e "${INFOC}INFO${NC}: ACS configuration loaded succesfully."
  fi
}

function acs_configure
{
    if [ -f "$PERSISTANT_FOLDER/$APP_NAME/config.js" ]
    then
      echo "A configuration already exists in $PERSISTANT_FOLDER/$APP_NAME"
      response=""
      while ! echo $response | grep -i "[ny]" > /dev/null
      do
        echo -n "Do you want to reconfigure (y/n)? "
        read response
        case $response in
          "Y"|"y") acs_conf;;
          *);;
        esac
      done
    else
      acs_conf
    fi
}

function menu_acs
{
  response=""
  while ! echo $response | grep -i "[b]" > /dev/null
  do
    echo ""
    echo "1) Change ACS parameters"
    echo "2) View ACS parameters"
    echo "b) Back"
    echo "Please make a choice"
    read response
    case $response in
      "1") acs_configure;;
      "2") cat $PERSISTANT_FOLDER/$APP_NAME/config.js;;
      "b") menu_main;;
    esac
  done
}

################################################################################
############################    MAIL_SRV
################################################################################

function email_save
{
  if [ -f "$PERSISTANT_FOLDER/$APP_NAME/mailer_config.js" ]
  then
    mv $PERSISTANT_FOLDER/$APP_NAME/mailer_config.js $PERSISTANT_FOLDER/$APP_NAME/mailer_config.js.bak
    if [ $? -eq 0 ]
    then
      echo -e "${INFOC}INFO${NC}: old configuration file backed up at $PERSISTANT_FOLDER/$APP_NAME/mailer_config.js.bak"
    else
      echo -e "${ERRORC}ERROR${NC}: can't backup old configuration file."
    fi
  fi

  echo "module.exports.config = {" >> $PERSISTANT_FOLDER/$APP_NAME/mailer_config.js
  echo "  host: '$EMAIL_SRV'," >> $PERSISTANT_FOLDER/$APP_NAME/mailer_config.js
  echo "  port: $EMAIL_SRV_PORT," >> $PERSISTANT_FOLDER/$APP_NAME/mailer_config.js
  echo "  secureConnection: $EMAIL_SRV_TLS," >> $PERSISTANT_FOLDER/$APP_NAME/mailer_config.js
  echo "  tls: {" >> $PERSISTANT_FOLDER/$APP_NAME/mailer_config.js
  echo "    ciphers: 'SSLv3'," >> $PERSISTANT_FOLDER/$APP_NAME/mailer_config.js
  echo "    rejectUnauthorized: false" >> $PERSISTANT_FOLDER/$APP_NAME/mailer_config.js
  echo "  }," >> $PERSISTANT_FOLDER/$APP_NAME/mailer_config.js
  echo "  auth: {" >> $PERSISTANT_FOLDER/$APP_NAME/mailer_config.js
  echo "    user: '$EMAIL_SRV_USER'," >> $PERSISTANT_FOLDER/$APP_NAME/mailer_config.js
  echo "    pass: '$EMAIL_SRV_PWD'" >> $PERSISTANT_FOLDER/$APP_NAME/mailer_config.js
  echo "  }" >> $PERSISTANT_FOLDER/$APP_NAME/mailer_config.js
  echo "};" >> $PERSISTANT_FOLDER/$APP_NAME/mailer_config.js
  echo "" >> $PERSISTANT_FOLDER/$APP_NAME/mailer_config.js

  if [ `$DOCKER ps | grep -c "$APP_NAME"` -eq 1 ]
  then
    echo ""
    echo -e "${WARNINGC}WARNING${NC}: $APP_NAME is running."
    echo "Do you want to restart the container to use the new configuration?"
    response=""
    while ! echo $response | grep -i "[ny]" > /dev/null
    do
      read -p "Restart (y/n)? " response
      case $response in
        "Y"|"y")
            $DOCKER restart $APP_NAME > /dev/null
            if [ $? -gt 0 ]
            then
              echo -e "${ERRORC}ERROR${NC}: Unable to restart container."
              echo "       You will have to manually restart it to use the new configuration."
            fi
            ;;
        *);;
      esac
    done
  elif [ `$DOCKER ps -a | grep -c "$APP_NAME"` -eq 1 ]
  then
      echo -e "${ERRORC}ERROR${NC}: $APP_NAME container is not started"
  fi
}

function email_conf
{
  correct="n"
  while ! echo $correct | grep -i "y" > /dev/null
  do
    echo "To use this APP, you can use an external Email server to send customized emails to users."
    echo ""
    response=""
  	while ! echo $response | grep -i "[ny]" > /dev/null
  	do
  	  echo -n "Do you want to configure your email server (y/n)? "
  	  read response
  	done
    if echo $response | grep -i "n" > /dev/null
    then
      correct="y"
    else
       echo $response | grep -i "y" > /dev/null
       read -p "Email server IP Address/Hostname: " EMAIL_SRV
       read -p "Email server port: " EMAIL_SRV_PORT
       while ! echo $EMAIL_SRV_TLS | grep -i "[yn]" > /dev/null
       do
         read -p "Use TLS connection with Email server (y/n)? " EMAIL_SRV_TLS
       done
       if echo $EMAIL_SRV_TLS | grep -i "y" > /dev/null
       then
         EMAIL_SRV_TLS=true
       else
         EMAIL_SRV_TLS=false
       fi
       echo ""
       read -p "Email server username: " EMAIL_SRV_USER
       echo -n "Email server password: "
       read -s EMAIL_SRV_PWD

       echo "PARAMETERS:"
       echo "Email Server: $EMAIL_SRV"
       echo "Email Server Port: $EMAIL_SRV_PORT"
       echo "Use secured connection: $EMAIL_SRV_TLS"
       echo "Email user: $EMAIL_SRV_USER"
       echo ""
       read -p "Is this correct (y/n)? " correct
     fi
   done
   touch $PERSISTANT_FOLDER/$APP_NAME/mailer_config.js
   if [ $? -eq 0 ]
   then
     echo -e "${INFOC}INFO${NC}: new configuration file saved at $PERSISTANT_FOLDER/$APP_NAME/mailer_config.js"
   else
     echo -e "${ERRORC}ERROR${NC}: can't save new configuration file."
   fi

   email_save
}

function email_configure
{
    if [ -f "$PERSISTANT_FOLDER/$APP_NAME/mailer_config.js" ]
    then
      echo "A configuration already exists in $PERSISTANT_FOLDER/$APP_NAME"
      response=""
      while ! echo $response | grep -i "[ny]" > /dev/null
      do
        echo -n "Do you want to reconfigure (y/n)? "
        read response
        case $response in
          "Y"|"y") email_conf;;
          *);;
        esac
      done
    else
      email_conf
    fi
}

function menu_email
{
  if $EMAIL_SRV_ENABLE == "true" > /dev/null
  then
    response=""
    while ! echo $response | grep -i "[b]" > /dev/null
    do
      echo ""
      echo "1) Change Email Server parameters"
      echo "2) View Email Server parameters"
      echo "b) Back"
      echo "Please make a choice"
      read response
      case $response in
        "1") email_configure;;
        "2") cat $PERSISTANT_FOLDER/$APP_NAME/mailer_config.js;;
        "b") menu_main;;
      esac
    done
  fi
}

################################################################################
############################    FOLDERS
################################################################################

function check_folder # $name $FOLDER_NAME
{
  if [ ! -d $2 ]
  then
    echo -e "${INFOC}INFO${NC}: $1 folder $2 doesn't exist. Creating it..."
    mkdir -p $2
    if [ $? -eq 0 ]
    then
      echo -e "${INFOC}INFO${NC}: $1 folder $2 created."
    else
      echo ""
      echo -e "${ERRORC}ERROR${NC}: Unable to create $1 folder $2."
    fi
  else
    echo -e "${INFOC}INFO${NC}: $1 folder already exists."
  fi
}

################################################################################
############################    CERTIFICATES
################################################################################

function check_certificates
{
  if $LETSENCRYPT_ENABLE == "true"
  then
    echo -e "${INFOC}INFO${NC}: Certificates will be managed by Let's Encrypt service."
  else
    if [ `ls $NGINX_CERTS_FOLDER | grep $NODEJS_VHOST.key | wc -l` -eq 0 ] || [ `ls $NGINX_CERTS_FOLDER | grep $NODEJS_VHOST.crt | wc -l` -eq 0 ]
    then
        echo -e "${INFOC}INFO${NC}: Certificates for $NODEJS_VHOST doesn't exist."
        echo "     Creating a self-signed certificate..."
        openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout $NGINX_CERTS_FOLDER/$NODEJS_VHOST.key -out $NGINX_CERTS_FOLDER/$NODEJS_VHOST.crt
        echo -e "${INFOC}INFO${NC}: Certificate for $NODEJS_VHOST created."
    else
        echo -e "${INFOC}INFO${NC}: Certificate for $NODEJS_VHOST already exists."
    fi
  fi
}

function new_certificate
{
  response="y"
  if echo $LETSENCRYPT_ENABLE == "true" > /dev/null
  then
    echo ""
    echo -e "${WARNINGC}WARNING${NC}: Let's Encrypt service is in use. If you generate a self-signed"
    echo "         certificate, it will remove the Let's encrypt certificates."
    echo ""
    read -p "Do you want to continue (y/n)? " response
  fi
  if echo $response | grep -i "y" > /dev/null
  then
    if [ -f "$NGINX_CERTS_FOLDER/$NODEJS_VHOST.crt" ]
    then
      echo -e "${INFOC}INFO${NC}: removing $NGINX_CERTS_FOLDER/$NODEJS_VHOST.crt"
      rm $NGINX_CERTS_FOLDER/$NODEJS_VHOST.crt
    fi
    if [ -f "$NGINX_CERTS_FOLDER/$NODEJS_VHOST.key" ]
    then
      echo -e "${INFOC}INFO${NC}: removing $NGINX_CERTS_FOLDER/$NODEJS_VHOST.key"
      rm $NGINX_CERTS_FOLDER/$NODEJS_VHOST.key
    fi
    openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout $NGINX_CERTS_FOLDER/$NODEJS_VHOST.key -out $NGINX_CERTS_FOLDER/$NODEJS_VHOST.crt
    echo -e "${INFOC}INFO${NC}: Certificate for $NODEJS_VHOST created."
  fi
}

function new_csr
{
  openssl req -out $NGINX_CERTS_FOLDER/$NODEJS_VHOST.csr -new -newkey rsa:2048 -nodes -keyout $NGINX_CERTS_FOLDER/$NODEJS_VHOST.key
  echo -e "${INFOC}INFO${NC}: new CSR generated. The CSR $NODEJS_VHOST.csr can be found in the folder $NGINX_CERTS_FOLDER"
  echo -e "${WARNINGC}WARNING${NC}: To be able to use the application, you will have to sign the CSR with"
  echo "         your Certificate Authority."
  echo "         The signed certificate has to be place into the folder"
  echo "         $NGINX_CERTS_FOLDER with the name $NODEJS_VHOST.crt"
}

function help_certificate
{
  echo -e "${INFOC}INFO${NC}: You can replace the self-signed certicate with your own certicate."
  echo "      To do so, you will have to generate a signed certificate on your own,"
  echo "      and to place the certificate and its private key into the folder"
  echo "      $NGINX_CERTS_FOLDER"
  echo "      The certificate has to be a X509 certificate in PEM format."
  echo "      At the end, you should have:"
  echo "      $NGINX_CERTS_FOLDER/$NODEJS_VHOST.crt"
  echo "      $NGINX_CERTS_FOLDER/$NODEJS_VHOST.key"
}

function read_certificate
{
  openssl x509 -in $NGINX_CERTS_FOLDER/$NODEJS_VHOST.crt -noout -text
}

function menu_certificates
{
  response=""
  while ! echo $response | grep -i "[b]" > /dev/null
  do
    echo ""
    echo "1) Generate new self-signed certificate"
    echo "2) Generate CSR"
    echo "3) Help to use custom certificate"
    echo "4) View current Certificate"
    echo "b) Back"
    echo "Please make a choice"
    read response
    case $response in
      "1") new_certificate;;
      "2") new_csr;;
      "3") help_certificate;;
      "4") read_certificate;;
      "b") menu_main;;
    esac
  done
}

################################################################################
############################    CREATE DOCKER IMAGES
################################################################################
function pull_image # $Xx_IMG
{
    echo ""
    if [ `$DOCKER images | cut -d" " -f1 | grep $1$ | wc -l` -eq 0 ]
    then
	echo -e "${INFOC}INFO${NC}: $1 image is not present. Installing it..."
	$DOCKER pull $1
	if [ $? -eq 0 ]
	then
	    echo -e "${INFOC}INFO${NC}: $1 image is now installed."
	else
	    echo -e "${ERRORC}ERROR${NC}: $1 image can't be installed."
	fi
    else
	echo -e "${INFOC}INFO${NC}: $1 image is already installed."
    fi
}

function check_image #$XX_IMG
{
  echo ""
  if [ `$DOCKER images | grep "$1" | wc -l` -eq 0 ]
  then
    echo -e "${WARNINGC}WARNING${NC}: Docker Image $1 is not installed."
    echo "         Please deploy all the needed images to run the Application"
    echo "         in a Docker environment."
  else
    echo -e "${INFOC}INFO${NC}: Docker Image $1 is installed"
  fi
}


function deploy_images
{
  if [ "$DB_IMG" ]
  then
    pull_image $DB_IMG
  fi
  pull_image $NGINX_IMG
  if $LETSENCRYPT_ENABLE == "true"
  then
    pull_image $LETSENCRYPT_IMG
  fi
  pull_image $APP_IMG
}

function remove_images
{
  if [ "$DB_IMG" ]
  then
    $DOCKER rmi $DB_IMG
  fi
  $DOCKER rmi $NGINX_IMG
  if $LETSENCRYPT_ENABLE == "true"
  then
    $DOCKER rmi $LETSENCRYPT_IMG
  fi
  $DOCKER rmi $APP_IMG
}

function check_images
{
  if [ "$DB_IMG" ]
  then
    check_image $DB_IMG
  fi
  check_image $NGINX_IMG
  if $LETSENCRYPT_ENABLE == "true"
  then
    check_image $LETSENCRYPT_IMG
  fi
  check_image $APP_IMG
}

function menu_images
{
  response="0"
  while ! echo $response | grep -i "[b]" > /dev/null
  do
    echo ""
    echo "1) Deploy Docker Images"
    echo "2) Remove Application Image"
    echo "3) Remove Application and Dependencies Images"
    echo "4) Check Docker Images"
    echo "b) Back"
    echo "Please make a choice"
    read response
    case $response in
      "1") deploy_images;;
      "2") $DOCKER rmi $APP_IMG;;
      "3") remove_images;;
      "4") check_images;;
    esac
  done
  response=""
}
################################################################################
############################    CREATE DOCKER CONTAINERS
################################################################################

function create_mongo_container
{
  echo ""
  if [ `$DOCKER ps -a | grep $DB_NAME | wc -l` -eq 0 ]
  then
    echo -e "${INFOC}INFO${NC}: $DB_NAME container not present. Creating it..."
    $DOCKER create \
    --name $DB_NAME \
    -v $DB_FOLDER:/data/db \
    $DB_IMG
    if [ $? -eq 0 ]
    then
      echo -e "${INFOC}INFO${NC}: $DB_NAME container is now created."
    else
      echo -e "${ERRORC}ERROR${NC}: $DB_NAME container can't be created."
    fi
  else
    echo -e "${INFOC}INFO${NC}: $DB_NAME container is already created."
  fi
}

function create_nginx_container
{
    echo ""
    if [ `$DOCKER ps -a | grep $NGINX_NAME | wc -l` -eq 0 ]
    then
	echo -e "${INFOC}INFO${NC}: $NGINX_NAME container not present. Creating it..."
	$DOCKER create \
	    -p 80:80 \
	    -p 443:443 \
	    --security-opt label:disable \
	    -v $NGINX_CERTS_FOLDER:/etc/nginx/certs:ro \
	    -v /etc/nginx/vhost.d \
	    -v /usr/share/nginx/html \
	    -v /var/run/docker.sock:/tmp/docker.sock:ro \
	    --name=$NGINX_NAME \
	    --restart="on-failure:5" \
	    $NGINX_IMG
	if [ $? -eq 0 ]
	then
	    echo -e "${INFOC}INFO${NC}: $NGINX_NAME container is now created."
	else
	    echo -e "${ERRORC}ERROR${NC}: $NGINX_NAME container can't be created."
	fi
    else
	echo -e "${INFOC}INFO${NC}: $NGINX_NAME container is already created."
    fi
}

function create_letsencrypt_container
{
    echo ""
    if [ `$DOCKER ps -a | grep $LETSENCRYPT_NAME | wc -l` -eq 0 ]
    then
	echo -e "${INFOC}INFO${NC}: $LETSENCRYPT_NAME container not present. Creating it..."
	$DOCKER create \
	    --security-opt label:disable \
	    -v $NGINX_CERTS_FOLDER:/etc/nginx/certs:rw \
	    --volumes-from $NGINX_NAME \
	    -v /var/run/docker.sock:/var/run/docker.sock:ro \
	    --name=$LETSENCRYPT_NAME \
	    --restart="on-failure:5" \
	    $LETSENCRYPT_IMG
	if [ $? -eq 0 ]
	then
	    echo -e "${INFOC}INFO${NC}: $LETSENCRYPT_NAME container is now created."
	else
	    echo -e "${ERRORC}ERROR${NC}: $LETSENCRYPT_NAME container can't be created."
	fi
    else
	echo -e "${INFOC}INFO${NC}: $LETSENCRYPT_NAME container is already created."
    fi
}

function check_container # $XX_NAME
{
  if [ `$DOCKER ps | grep -c "$1"` -gt 0 ]
  then
    echo "$1: INSTALLED and RUNNING"
  elif [ `$DOCKER ps -a | grep -c "$1"` -gt 0 ]
  then
    echo "$1: INSTALLED and STOPPED"
  else
    echo "$1: NOT INSTALLED"
  fi
}
function start_container # $XX_NAME
{
  echo ""
  if [ `$DOCKER ps -a | grep $1 | wc -l` -eq 0 ]
  then
    echo -e "${ERRORC}ERROR${NC}: $1 container is not created. Please create it before."
    retval=1
  elif [ `$DOCKER ps | grep $1 | wc -l` -eq 0 ]
  then
    echo -e "${INFOC}INFO${NC}: $1 container is not started. starting it..."
    CID=`$DOCKER ps -a | grep $1 | cut -d" " -f1`
    $DOCKER start $CID
    retval=$?
    if [ $retval -eq 0 ]
    then
      echo -e "${INFOC}INFO${NC}: $1 container is now started."
      retval=0
    else
      echo -e "${ERRORC}ERROR${NC}: $1 container can't be started."
      retval=1
    fi
  else
    echo -e "${INFOC}INFO${NC}: $1 container is alreay running."
    retval=0
  fi
  return $retval
}

function result_banner
{
  echo ""
  echo ""
  echo "============================================================================"
  echo "============================================================================"
  echo "                  The system is now up and running!"
  echo ""
  if [ "$DB_NAME" ]
  then
    echo -e "${INFOC}INFO${NC}: MongoDB files are in $DB_FOLDER"
    echo ""
  fi
  echo -e "${INFOC}INFO${NC}: NGINX SSL/TLS certifcates are in $NGINX_CERTS_FOLDER"
  echo ""
  echo -e "${INFOC}INFO${NC}: $APP_NAME interface should now be avaible soon"
  echo "      https://$NODEJS_VHOST"
  echo ""
  if $LETSENCRYPT_ENABLE == "true" > /dev/null
  then
    echo -e "${WARNINGC}WARNING${NC}: If you just installed Let's Encrypt service, it can take some time"
    echo "         to start."
    echo "         You can still check starting process with the command"
    echo "         \"docker logs $LETSENCRYPT_NAME\""
    echo ""
  fi
  echo "============================================================================"
  echo "============================================================================"
}

function start_containers
{
  if [ "$DB_NAME" ]
  then
    start_container $DB_NAME
    retvalDB=$?
  else
    retvalDB=0
  fi
  start_container $NGINX_NAME
  retvalNGINX=$?
  if "$LETSENCRYPT_ENABLE" == "true" > /dev/null
  then
    start_container $LETSENCRYPT_NAME
    retvalLETSENCRYPT=$?
  else
    retvalLETSENCRYPT=0
  fi
  start_container $APP_NAME
  retvalAPP=$?
  if [ $retvalDB -eq 0 ] && [ $retvalNGINX -eq 0 ] && [ $retvalLETSENCRYPT -eq 0 ] && [ $retvalAPP -eq 0 ]
  then
    result_banner
  else
    echo ""
    echo -e "${WARNINGC}WARNING${NC}: Some containers are not started. The Application may not"
    echo "         be accesssible."
    echo "         Please fix the errors and retry."
  fi
  echo ""
}


function create_containers
{
  if [ "$DB_NAME" ]
  then
    create_mongo_container
  fi
  create_nginx_container
  if $LETSENCRYPT_ENABLE == "true"
  then
    create_letsencrypt_container
  fi
  create_app_container $APP_NAME $DB_NAME $VHOST
}

function remove_force_container
{
  $DOCKER rm -f $1 > /dev/null
  if [ $? -eq 0 ]
  then
    echo -e "${INFOC}INFO${NC}: $APP_NAME container is now removed."
  else
    echo -e "${ERRORC}ERROR${NC}: $APP_NAME container can't be removed."
  fi
}

function remove_container
{
  if [ `$DOCKER ps | grep $1 | wc -l` -gt 0 ]
  then
    echo -e "${INFOC}INFO${NC}: Container $1 is still running. Are you sure you want to remove it?"
    response=""
    while ! echo "$response" | grep -i "[yn]" > /dev/null
    do
      read -p "Force the removal (y/n)? " response
      case $response in
        "Y"|"y") remove_force_container $1;;
      esac
    done
  elif [ `$DOCKER ps -a | grep $1 | wc -l` -gt 0 ]
  then
    $DOCKER rm $1 > /dev/null
    if [ $? -eq 0 ]
    then
      echo -e "${INFOC}INFO${NC}: $1 container is now removed."
    else
      echo -e "${ERRORC}ERROR${NC}: $1 container can't be removed."

    fi
  else
    echo -e "${INFOC}INFO${NC}: Container $1 is not present. No need to remove it..."
  fi
}

function remove_containers
{
  remove_container $DB_NAME
  remove_container $NGINX_NAME
  if $LETSENCRYPT_ENABLE == "true"
  then
    remove_container $LETSENCRYPT_NAME
  fi
  remove_container $APP_NAME
}

function stop_container # $XX_NAME
{
  if [ `$DOCKER ps | grep $1 | wc -l` -gt 0 ]
  then
    echo -e "${INFOC}INFO${NC}: $1 container is running. stopping it..."
    echo ""
    $DOCKER stop $1
    retval=$?
    if [ $retval -eq 0 ]
    then
      echo -e "${INFOC}INFO${NC}: $1 container is now stopped."
      retval=0
    else
      echo ""
      echo -e "${ERRORC}ERROR${NC}: $1 container can't be stopped."
      retval=1
    fi
  else
    echo -e "${INFOC}INFO${NC}: $1 container was not started."
    retval=0
  fi
  return $retval
}
function stop_containers
{
  stop_container $DB_NAME
  stop_container $NGINX_NAME
  if $LETSENCRYPT_ENABLE == "true"
  then
    stop_container $LETSENCRYPT_NAME
  fi
  stop_container $APP_NAME
}
function check_containers
{
  check_container $DB_NAME
  check_container $NGINX_NAME
  if $LETSENCRYPT_ENABLE == "true"
  then
    check_container $LETSENCRYPT_NAME
  fi
  check_container $APP_NAME
}
function menu_containers
{
  response="0"
  while ! echo $response | grep -i "[b]" > /dev/null
  do
    echo ""
    echo "1) Create Docker Containers"
    echo "2) Remove Application Container"
    echo "3) Remove Application and Dependencies Containers"
    echo "4) Check Docker Containers"
    echo "5) Start Docker Containers"
    echo "6) Stop Application Containers"
    echo "7) Stop Application and Dependencies Containers"
    echo "8) Restart Application Container"
    echo "9) Restart Application and Dependencies Containers"
    echo "b) Back"
    echo "Please make a choice"
    read response
    case $response in
      "1") create_containers;;
      "2") remove_container $APP_NAME;;
      "3") remove_containers;;
      "4") check_containers;;
      "5") start_containers;;
      "6") stop_container $APP_NAME;;
      "7") stop_containers;;
      "8") stop_container $APP_NAME; start_container $APP_NAME;;
      "9") stop_containers; start_containers;;
    esac
  done
}


################################################################################
############################    DEPLOY
################################################################################
function auto_deploy
{
  deploy_images
  create_containers
  start_containers
}

function deploy
{
  echo "-----=============-----"
  echo "--=== DEPLOY INIT ===--"
  echo ""
  echo ""
  echo "This script will automatically"
  echo "  - Download Docker Images (Database, Proxy, App)"
  echo "  - Create Docker Containers based on the configuration you gave"
  echo "  - Start Docker Containers"
  echo ""
  response=""
  while ! echo "$response" | grep -i "[yn]" > /dev/null
  do

    read -p "Do you want to continue (y/n)? " response
    case $response in
      "y"|"Y") auto_deploy;;
    esac
  done
}

################################################################################
############################    UPDATE
################################################################################
function update_app
{
  stop_container $APP_NAME
  remove_container $APP_NAME
  $DOCKER rmi $APP_IMG
  pull_image $APP_IMG
  create_app_container
  start_container $APP_NAME
}


################################################################################
############################    INIT
################################################################################
function check_docker
{
  DOCKER=`which docker`
  if ! echo "$DOCKER" | grep -i "docker" > /dev/null
  then
    echo -e "${ERRORC}ERROR${NC}: Unable to find docker path."
    echo "       Plese install docker first: https://www.docker.com/products/overview"
    echo "Exiting..."
    exit 255
  else
    echo -e "${INFOC}INFO${NC}: docker found at $DOCKER"
  fi
}

function init_script
{
  banner "$APP_NAME Management Script"

  check_docker

  init_script_conf

  check_folder "Database" $DB_FOLDER
  check_folder "Certificates" $NGINX_CERTS_FOLDER
  check_folder "App" "$PERSISTANT_FOLDER/$APP_NAME"
  check_folder "bower_components" "$PERSISTANT_FOLDER/bower_components"

  init_acs_conf

  check_certificates

  echo -e "${INFOC}INFO${NC}: Script init done."
  echo "||============================================================================="
}

function menu_app
{
  response="0"
  while ! echo $response | grep -i "[b]" > /dev/null
  do
    echo ""
    echo "1) Manage Docker Images"
    echo "2) Manage Docker Containers"
    echo "3) View Application Status"
    echo "b) Back"
    echo "Please make a choice"
    read response
    case $response in
      "1") menu_images;;
      "2") menu_containers;;
      "3") check_containers;;
    esac
  done
}

function menu_main
{
  response="0"
  while ! echo $response | grep -i "[x]" > /dev/null
  do
    echo ""
    echo "1) Deploy and Start Application"
    echo "2) Update Application"
    echo "3) Manage Application"
    echo "4) HTTPS certificates"
    echo "5) Script parameters"
    echo "6) ACS parameters"
    if $EMAIL_SRV_ENABLE == "true" > /dev/null
    then
      echo "7) Email server parameters"
    fi
    echo "x) Exit"
    echo "Please make a choice"
    read response
    case $response in
      "1") deploy;;
      "2") update_app;;
      "3") menu_app;;
      "4") menu_certificates;;
      "5") menu_script;;
      "6") menu_acs;;
      "7") if "$EMAIL_SRV_ENABLE" == true; then menu_email; fi;;
      "x") exit 0;;
    esac
  done
}


################################################################################
############################    USAGE
################################################################################
usage ()
{
cat <<EOF

NAME
        $SCRIPT_NAME - Installation, Configuration and Control script
                    for $APP_NAME app

SYNOPSIS
        $SCRIPT_NAME [WORD]

DESCRIPTION
        This script will run the action to install, configure and control the
        needed docker containers for Get-a-Key web app.

options are
        start         Validates the configuration and starts all the containers
                      If needed, this will download and install all the needed
                      containers.
        stop          Stops all the containers.
        restart       Same as "stop all" and "start all"
        list          List the containers used by this app.

        help          this help
EOF
}




################################################################################
############################    ENTRY POINT
################################################################################


if [ $# -eq 0 ]
then
  init_script
  menu_main
elif [ $# -eq 1 ]
then
  case $1 in
    "start") init_script; start_containers;;
    "stop") init_script; stop_containers;;
    "restart") init_script; stop_containers; start_containers;;
    "list") init_script; check_containers;;
    *) usage; exit 1;;
  esac
else
  usage
  exit 1
fi
