![Logo](admin/icon.png)
# ioBroker.device-reminder

![Number of Installations (stable)](http://iobroker.live/badges/device-reminder-stable.svg)
![Number of Installations (latest)](http://iobroker.live/badges/device-reminder-installed.svg)
[![NPM version](http://img.shields.io/npm/v/iobroker.device-reminder.svg)](https://www.npmjs.com/package/iobroker.device-reminder)
[![Downloads](https://img.shields.io/npm/dm/iobroker.device-reminder.svg)](https://www.npmjs.com/package/iobroker.device-reminder)
[![Dependency Status](https://img.shields.io/david/xenon-s/iobroker.device-reminder.svg)](https://david-dm.org/xenon-s/iobroker.device-reminder)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/xenon-s/iobroker.device-reminder/LICENSE)
![Test and Release](https://github.com/xenon-s/iobroker.device-reminder/workflows/Test%20and%20Release/badge.svg)

[![Paypal Donation](https://img.shields.io/badge/paypal-donate%20%7C%20spenden-blue.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=3EYML5A4EMJCW&source=url)

[![NPM](https://nodei.co/npm/iobroker.device-reminder.png?downloads=true)](https://nodei.co/npm/iobroker.device-reminder/)

## English readme needed? <br>[english readme](https://github.com/Xenon-s/ioBroker.device-reminder/blob/master/README.md)
<br>

# Adapter zur Überwachung von Gerätezuständen Version 1.0
Dieser Adapter kann anhand von Messsteckdosen erkennen, ob ein Gerät eingeschaltet, in Betrieb ist oder ausgeschaltet wurde und darauf reagieren. Es können dann Nachrichten per Telegram, whatsapp, alexa, sayit, pushover und Email (Mehrfachauswahl pro Gerät möglich) automatisiert ausgegeben werden. Es ist ebenfalls möglich, die Steckdose nach Beendigung des Vorgangs automatisch abzuschalten (auch Zeitverzögert).

# Was sollte beachtet werden?
Der refresh Intervall vom "Live-Verbrauchswert (heißt bei den meisten Geräten **"_energy"**)" sollte nicht mehr als 10 Sekunden betragen, da es sonst zu sehr stark verzögerten Meldungen kommen kann.
<br>Befehl in der Tasmota Konsole : TelePeriod 10
<br>**Hinweis:**
- Werte unter 1 Watt werden als 0 Watt angesehen und geben automatisch "**ausgeschaltet**" an
- Werte über 1 Watt geben das Gerät als "**Standby**" an

# Was ist pro Gerät möglich?
- Benachrichtigung beim Gerätestart
- Benachrichtigung beim Vorgangsende des jeweiligen Gerätes 
- Telegram-Benachrichtigung (mehrere IDs sind möglich) 
- Alexa-Benachrichtigung (mehrere IDs sind möglich) 
- WhatsApp-Benachrichtung (mehrere IDs sind möglich)
- Pushover-Benachrichtung (mehrere IDs sind möglich)
- Email-Benachrichtung (mehrere IDs sind möglich)
- Benachrichtigungen können frei erstellt oder auch von einem externen Script vorgegeben werden
- Datenpunkte mit dem aktuellen Zustand, Live-Verbrauch und letzte gesendete Statusmeldung, um Werte aus diesem Adapter in anderen Scripten verwenden zu können
- Geräte bei Bedarf abschalten (auch zeitverzögert), wenn Vorgang beendet erkannt wurde
- Sprachassistenten können per Datenpunkt vorrübergehen deaktiviert werden

# Anleitung

## device anlegen
![addDevice.png](admin/addDevice.png)

- **device name**: Frei wählbarer Name
- **device type**: hier muss ausgewählt werden, um welches Gerät es sich handelt, damit die Berechnungen im Adapter korrekt ausgeführt werden können
- **consumption/energy**: Per Klick auf die Schaltfläche mit den drei weißen Punkten öffnet sich eure Objektverwaltung. Es muss der Datenpunkt ausgewählt werden, welcher den **aktuellen Live-Verbrauch** anzeigt. 
- **switch on/off**: Per Klick auf die Schaltfläche mit den drei weißen Punkten öffnet sich eure Objektverwaltung. Es muss der Datenpunkt ausgewählt werden, welcher eure **Steckdose an/aus schaltet** (keine Pflicht)
- **Starttext**: Benachrichtigung die gesendet werden soll, wenn das Gerät gestartet wird (auch Sonderzeichen sind möglich). Es darf sich kein "." am Ende befinden!
- **Endtext**: Benachrichtigung die gesendet werden soll, wenn das Gerät seinen Vorgang beendet hat (auch Sonderzeichen sind möglich). Es darf sich kein "." am Ende befinden!

Bei **Starttext** und **Endtext** kann man sich auch eine Nachricht aus einem externen Datenpunkt holen. Diese Nachricht wird mit 1 Sekunde Verzögerung aus dem Datenpunkt gelesen, nachdem sich der Status des Geräts geändert hat. Somit kann man sich per externem Script eine Nachricht erstellen lassen. Der Adapter erkennt automatisch, ob eine Nachricht aus einem Datenpunkt stammt oder ob diese manuell einfach nur eingegeben wurde. Um einen Datenpunkt auszuwählen, einfach auf die Schaltfläche mit den drei weißen Punkten klicken und dann den entsprechenden Datenpunkt auswählen. **Bitte beachten**: es kann nur entweder ein Datenpunkt **oder** eine händisch eingetragene Nachricht verwendet werden!
<br>
<br>

## Alexa erstellen
![addAlexa.png](admin/addAlexa.png)

- **alexa name**: Frei wählbarer Name, auch Sonderzeichen sind möglich
- **alexa"announcement"/"speak"**: Hier muss **zwingend** der Datenpunkt ausgewählt werden, welcher eure Alexa sprechen lässt. Um den Datenpunkt auszuwählen, einfach auf die Schaltfläche mit den drei kleinen weißen Punkten klicken.
- **volume 0-100**: Lautstärke, mit der eure Alexa sprechen soll (von 0 - 100%)
Mit den 4 letzten Feldern kann ein Zeitraum erstellt werden, in dem eure Alexa Sprachausgaben tätigen darf. Standardmäßig ist der Zeitraum von 00:00 Uhr - 23:59 Uhr aktiv.
- **"active from hour"**: Startzeit in Stunden
- **"active from minutes"**: Startzeit in Minuten
- **"inactive from hour"**: Endzeit in Stunden
- **"inactive from minutes"**: Endzeit in Minuten
<br>
<br>

## SayIt device erstellen
![addSayit.png](admin/addSayit.png)

- **sayit name**: Frei wählbarer Name, auch Sonderzeichen sind möglich
- **sayit path"../text"**: den Datenpunkt "text" im jeweiligen sayIt device Ordner auswählen. Hier wird die Textausgabe hingesendet.
- **volume 0-100**: Lautstärke, mit der euer sayit device sprechen soll (von 0 - 100%)
- **"active from hour"**: Startzeit in Stunden
- **"active from minutes"**: Startzeit in Minuten
- **"inactive from hour"**: Endzeit in Stunden
- **"inactive from minutes"**: Endzeit in Minuten
<br>
<br>

## whatsapp user erstellen
![addWhatsapp.png](admin/addWhatsapp.png)

- **whatsapp name**: Frei wählbarer Name, auch Sonderzeichen sind möglich
- **whatsapp path"sendMessage"**: den Datenpunkt "sendMessage" im jeweiligen whatsapp Ordner auswählen. Hier wird die Textausgabe hingesendet.

## pushover user erstellen
![addPushover.png](admin/addPushover.png)

- **name**: Frei wählbarer Name, auch Sonderzeichen sind möglich
- **pushover instance"**: die Instanz, an die gesendet werden soll
- **priority**: Die Priorität, mit der gesendet werden soll
- **sound**: Der Sound, der abgespielt werden soll, wenn Pushover die Nachricht erhält

## email user erstellen
![addEmail.png](admin/addEmail.png)

- **name**: Frei wählbarer Name, auch Sonderzeichen sind möglich
- **sender address**: Emailadresse, von der aus gesendet wird
- **receiver address**: Emailadresse, die die Nachricht empfangen soll

# default devices
![default-devices.png](admin/default-devices.png)
Diese Werte wurden über einen Zeitraum von mehreren Monaten und mit Hilfe von zahlreichen Testern ermittelt. Änderungen der Werte können dazu führen, dass Geräte nicht mehr Ordnungsgemäß erfasst werden und es so zu Falschmeldungen kommt. 

# custom-devices
![custom-devices.png](admin/custom-devices.png)
Diese Werte können von Benutzer angepasst und dann genutzt werden. Im Folgenden die Erklärung dazu:

- **starting value**: Startwert in Watt der überschritten werden muss, damit das Gerät als gestartet erkannt werden kann
- **final value**: Endwert in Watt der unterschritten werden muss, damit das Gerät als beendet erkannt werden kann
- **Number of values​​ "start"**: Hier wird angegeben, wie oft der "Startwert" **in Folge** überschritten werden muss. Ein einmaliges Unterschreiten führt zum Startabbruch. Der Durchschnitt dieser Werte muss über dem Startwert liegen, damit das Gerät als gestartet erkannt wird.
*Bsp: Der Wert soll 10W betragen und 3x in Folge überschritten werden. 1. 15W, 2. 1W, 15W => Startphase wurde abgebrochen, weil der zweite Wert unter 10 lag.*
- **Number of values ​"end"**: Hier wird angegeben, wie viele Werte aufgezeichnet werden sollen, bevor berechnet wird, ob das Gerät fertig ist. Je weniger Werte hier stehen, desto ungenauer ist das Ergebnis und die Gefahr von Falschmeldungen steigt. Je höher der Wert, umso genauer die Erfassung. Nachteil ist jedoch, dass die Fertigmeldung stark verzögert gesendet wird. Ende wird erst dann erkannt, wenn "number of values end" erreicht ist und der Durchschnittsverbrauch unter dem "final value" liegt.

*Kurze Beispielrechnung:*
Es kommen alle 10 Sekunden Verbrauchswerte rein. **final value** steht auf 50, **values end** auf 100. Nachdem das Gerät als gestartet erkannt wurde, werden 100 Werte (*dauert 100Werte x 10 Sekunden = 1000 Sekunden*) aufgezeichnet und erst danach der Mittelwert gebildet. Liegt dieser unter 50, wird nach ca 16,5 Minuten (wir erinnern uns an **values end** = 100 Werte) **fertig** erkannt und es geht eine Meldung (wenn denn konfiguriert) raus. Liegt der Wert über 50, passiert nichts, da das Gerät noch in Betrieb ist. Jeder weitere Wert ersetzt nun den ältesten und es wird nach jedem neuen Wert ein neuer Durchschnitt berechnet.
<br>

# Devices konfigurieren
![configureDevices.png](admin/configureDevices.png)

![refresh-table.png](admin/refresh-table.png) <br>
Sollte der Button "refresh" blau sein, bitte diesen anklicken. Es werden nur die Geräte angezeigt, bei denen keine Fehler erkannt wurden.

- **active**: Ist standardmäßig aktiviert. Hier kann man ein Device vorrübergehend deaktivieren, so dass es keine Benachrichtigungen mehr sendet
- **device**: wird automatisch angelegt
- **Alexa**: alle zuvor erstellen Alexas werden hier aufgelistet und können per Klick hinzugefügt werden
- **sayit**: alle zuvor erstellen sayit devices werden hier aufgelistet und können per Klick hinzugefügt werden
- **whatsapp**: alle zuvor angelegten whatsapp user werden hier aufgelistet und können per Klick hinzugefügt werden
- **Pushover**: alle zuvor angelegten Pushover user werden hier aufgelistet und können per Klick hinzugefügt werden
- **email**: alle zuvor angelegten email user werden hier aufgelistet und können per Klick hinzugefügt werden
- **Telegram**: Hier werden alle verfügbaren Telegram User angezeigt und können per Klick dem Gerät zugeordnet werden. In der [eckigen] Klammer wird die jeweilige Instanz angegeben.

    **Sollten keine Namen angezeigt werden:**
    Prüfen, ob der Eintrag unter "telegram.X.communicate.users" (das X steht für die jeweilige Instanz, zb 0) folgende Struktur enthält: "{"ID IN ZAHLEN":{"firstName":"User1"}}", wenn nicht kann diese einfach angepasst werden. Der Adapter sucht sowohl nach **firstName**, als auch nach **userName**. Man kann sich dann entscheiden, an welchen Namen gesendet werden soll. Es kann nur entweder der **firstName** oder der **userName** gewählt werden!

- **switch off**: Wenn angewählt, schaltet sich die Steckdose nach Beendigung des Vorgangs automatisch ab
- **switch off after minutes**: Hier kann optional ein timeout in **Minuten** eingegeben werden. Nach Ablauf des timeouts wird die Steckdose, *wenn auto off denn altiviert ist*, abgeschaltet. Die Ende Benachrichtigung des Gerätes bleibt von einem timeout jedoch unberührt!
- **abort detection**: Wenn aktiviert, versucht der Adapter zu erkennen, ob ein Gerät bereits vor der Benachrichtigung von Hand abgeschaltet wurde und meldet dann nicht mehr.

Nachdem nun auf "**Speichern und schliessen**" geklickt wurde, wird unter *Objekte -> device-reminder* nun für jedes neu angelegte Device ein Ordner erstellt, in dem 
- die aktuelle Laufzeit in hh:mm:ss  
- die aktuelle Laufzeit in Millisekunden
- der aktuelle Zustand des devices
- der aktuelle Live-Verbrauch (wird aus dem *path consumption/energy* geholt) und
- die Nachricht an die Messenger
- averageConsumption (Kann als Hilfe genutzt werden um die eigenen Schwellwerte zu ermitteln)
- do not disturb (wenn aktiviert, werden keine Nachrichten per **Sprachassistent** versendet)
angezeigt wird.
<br>

# Unterstützung
**Falls euch meine Arbeit gefällt :** <br>

[![paypal](https://www.paypalobjects.com/en_US/DK/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=3EYML5A4EMJCW&source=url) 


## Changelog

Der Changelog ist in der englischen Version der readme zu finden <br>
[english readme](https://github.com/Xenon-s/ioBroker.device-reminder/blob/master/README.md)
<br>

# License

MIT License

Copyright (c) 2021 xenon-s

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.