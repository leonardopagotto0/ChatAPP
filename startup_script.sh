#!/bin/bash
sudo apt-get update && sudo apt-get update
sudo apt install awscli -y

# Instalando dependencias
sudo apt install nodejs -y
sudo apt install npm -y
sudo apt install git -y

# criando pasta da aplicação
mkdir chatAPP && cd chatAPP
git clone https://github.com/leonardopagotto0/ChatAPP.git