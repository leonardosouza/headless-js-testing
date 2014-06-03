var Cloud = Cloud || {};
Cloud.modules = Cloud.modules || {};
Cloud.modules.vms = Cloud.modules.vms || {};

Cloud.modules.vms.serversEdit = function(box) {
    /**
    * Inicializa os métodos de acordo com a página especificada
    *
    * @method init
    * @param {string} page nome da página a qual os métodos serão invocados
    * @return executa todas os métodos
    */
    box.init = function(page) {
        if (page === 'MANAGE_SERVER') {
            box.instanceLabels(['#fieldservername','#fieldescription'],['#save','#cancel','#modify'],['.editable','.not-editable']);
            box.connect('#connect-server, .ligar-servidor a, .start-server');
            box.disconnect('#disconnect-server','disconnect');
            box.restart('#restart-server, .reiniciar-servidor a, #reiniciar-servidor, #ip-reset');
            box.changeOperatingSystem('#modify-os');
            box.acessApp('#acess-app');
            box.attachDisk('.attach-disk');
            box.createBackup('.backup-create');
            box.deleteBackup('.backup-delete');
            box.abortBackup('.abort-backup','.abort-update');
            box.updateBackup('.backup-update');
            box.restoreBackup('.backup-restore');
            box.cancelScheduling('.cancel-request');
            box.showPassword('#viewPassword');
            box.cancelPlan('#cancel-server');
            box.upgradeOrDowngrade('.up-down-grade');
            box.detachFreeDisk('.detach-free-disk');
            box.submitToPage(['#poweroff-server','#change-plan','#change-os','#cancel-instance','#view-history','#view-monitoring','.manage-firewall','.contract-ip']);
            // box.copyHeight('#external-disks');
            box.viewContactData();
            box.updatePageElements();
            box.updateStatusIp('.solicitarIp, .solicitarIpDesligado');
            box.privateIpProcedureCentOS('#active-ip-centos');
            box.copyHeight('.status','.system-installed', '.access', '.external-disks', '.backup', '.load-balancing');
            box.controlBackupType('.type-backup');
            box.generalScheduling('.btn-schedule');
            box.backupImmediate('.backup-immediate');
            box.backupTips('.tips a');
            box.showBackupInfo('.backup-edit');
            box.updateBackupInfo('.edit');
        }
    };


    /**
    * Controla todos os elementos envolvidos na edição de dados do servidor
    *
    * @method instanceLabels
    * @param {array} fields campos do formulario
    * @param {array} buttons botoes ou links que executam determinada ação
    * @param {array} sections box que devera ser exibido / oculto pela interface
    * @return {undefined} este método não traz qualquer retorno
    */
    box.instanceLabels = function(fields, buttons, sections, crossdomain) {
        box.controlFields(fields);
        box.saveLabels(sections,fields,buttons[0],crossdomain);
        box.cancelLabels(sections,buttons[1]);
        box.modifyLabels(sections,fields, buttons[2]);
        $('#external-disks dl:last').addClass('last');
    };


    /**
    * Limpa um campo quando acionado ou preenche com o conteúdo anterior caso fique vazio
    *
    * @method controlFields
    * @param {array} fields campos do formulario que devem ser controlados
    * @return {undefined} este método não traz qualquer retorno
    */
    box.controlFields = function(fields) {
        var x,
            fnAdjust = function(e) {
                box.parentIframeAdjust($('#container')[0].offsetHeight);
            },
            fnValidate = function(e) {
                if($.trim($('#fieldservername').val()) !== "") {
                    $('.editable #fieldservername').attr('rel',$('#fieldservername').val());
                }

                $('.editable #fieldescription').attr('rel',$('#fieldescription').val());

                if($.trim($(fields[e.data.i]).val()) === '') {
                    $(this).val($(this).attr('rel'));
                    box.parentIframeAdjust($('#container')[0].offsetHeight);
                }
            };



        $('#manage').unbind('submit');
        for(x in fields) {
            $(fields[x])
                .click(fnAdjust)
                .blur({ i : x}, fnValidate);
        }
    };


    /**
    * Valida e salva os dados preenchidos pelo usuário
    *
    * @method saveLabels
    * @param {array} sections determina o box / escopo onde as acoes devem ser executadas
    * @param {array} fields campos do formulario que devem ser controlados
    * @param {string} button identifica que botao deve ser acionada para executar as acoes
    * @return {undefined} este método não traz qualquer retorno
    */
    box.saveLabels = function(sections,fields,button,crossdomain) {
        box.sendFormByReturn($('#fieldservername'), $(button));
        $(button).unbind().click(function() {
            var serverName = ($.trim($('#fieldservername').val()) || $('#fieldservername').attr('rel'));
            var cross = crossdomain || false;
            var codeServer = ['crossdomain='+cross, 'idtServer='+$(this).attr('rel'), 'serverName='+encodeURI(serverName)];
            box.ajaxJson('/virtual-machines/servers/edit/update.json', codeServer.join('&'), { method: 'POST', fnBeforeSend: box.genericWaiting, fnSuccess: box.instanceLabelsSuccess, fnError: box.genericCallbackError});
            return false;
        });
    };


    /**
    * Cancela a edição de informações sobre o servidor
    *
    * @method cancelLabels
    * @param {array} sections determina o box / escopo onde as acoes devem ser executadas
    * @param {string} button identifica que botao deve ser acionada para executar as acoes
    * @return {undefined} este método não traz qualquer retorno
    */
    box.cancelLabels = function(sections,button) {
        $(button).unbind().click(function() {
            if($(this).hasClass('disabled')) { return false; }

            $(sections[0]).addClass('hide');
            $(sections[1]).removeClass('hide');
        });
    };

    /**
    * Ativa a edição dos campos com os dados do servidor
    *
    * @method modifyLabels
    * @param {array} sections determina o box / escopo onde as acoes devem ser executadas
    * @param {string} button identifica que botao deve ser acionada para executar as acoes
    * @return {undefined} este método não traz qualquer retorno
    */
    box.modifyLabels = function(sections,fields, button) {
        $(button).unbind().click(function() {
            if($.trim($(fields[0]).val()) === '') {
                $(fields[0]).val($(fields[0]).attr('rel'));
            }
            $(sections[0]).removeClass('hide');
            $(sections[1]).addClass('hide');
        });
    };

    /**
    * Avalia se a API conseguiu atualizar os dados do servidor e exibe uma mensagem
    *
    * @method instanceLabelsSuccess
    * @param {object} j retorna o objeto json para manipulação
    * @return {undefined} este método não traz qualquer retorno
    */
    box.instanceLabelsSuccess = function(j) {
        var updateSuccess = j.update || false;
        var updateError = j.error || false;
        var genericError = j.genericResponse || false;
        var sessionStatus = j.sessionStatus || false;

        // sucess
        if (updateSuccess && updateSuccess.success == "true") {
            var serverName = $.trim(updateSuccess.serverName) || $('#fieldservername').attr('rel');
            $('.not-editable .servername').html(serverName);
            tb_remove();
            box.heightModal();
            $('.editable').addClass('hide');
            $('.not-editable').removeClass('hide');
            $('#cancel').removeClass('disabled');
            // Caso mensagem de erro esteja visivel
            if(!$('#msg-error').hasClass('hide')){
                $('#msg-error').addClass('hide');
            }
            if(updateSuccess.crossdomain == "true") {
                box.setAppName("https://loja.host.uol.com.br/service/upd/app-name.json",$('input#fieldapp').val(),serverName);
            }
        }

        // error
        if(updateError || genericError){
            box.errorHandler('#msg-error', updateError, genericError, sessionStatus, false);
            box.heightModal();
            $('.editable').addClass('hide');
            $('.editable').addClass('hide');
            $('.not-editable').removeClass('hide');
            $('#cancel').removeClass('disabled');
        }
    };


    /**
    * Desliga um servidor
    *
    * @method disconnect
    * @param {string} button identifica o botao que invocará os eventos para desligar a máquina
    * @return {undefined} este método não traz qualquer retorno
    */
    box.disconnect = function(button, origin) {
        $(button).unbind().click(function(e){
            if ($(this).hasClass('disabled')) {return false;}

            if (!$("#rebootIp").hasClass('hide')) {
                $("#rebootIp").addClass("hide");
            }
            var codeServer = [];
            codeServer.push('idtServer='+$(this).attr('rel'));
            codeServer.push('origin='+origin);
            box.ajaxJson('/virtual-machines/servers/edit/disconnect.json', codeServer.join('&'), { method: 'POST',fnBeforeSend: box.disconnectWaiting, fnSuccess: box.disconnectSuccess, fnError: box.genericCallbackError });
        });
    };


    /**
    * Exibe uma mensagem durante o processo de desligamento
    *
    * @method disconnectWaiting
    * @param {undefined} este método não recebe qualquer parâmetro
    * @return {undefined} este método não traz qualquer retorno
    */
    box.disconnectWaiting = function() {
        $('dl.status dd').eq(0).html('Desligando');
        box.disableAllElements(box.MANAGE_SERVER_ELEMENTS,['#poweroff-server','.contract-ip']);
        box.hideAllMessages();
        $('#msg-disconnect-wait').removeClass('hide');
        box.parentIframeAdjust($('#container')[0].offsetHeight);
    };

    /**
    * Avalia se foi possível desligar a máquina e faz um pulling que monitora os estados e atualiza a interface
    *
    * @method disconnectSuccess
    * @param {object} j retorna o objeto json para manipulação
    * @return {undefined} este método não traz qualquer retorno
    */
    box.disconnectSuccess = function(j) {
        var stopSuccess = j.stop || false;
        var stopError = j.error || false;
        var genericError = j.genericResponse || false;
        var sessionStatus = j.sessionStatus || false;

        // sucess
        if (stopSuccess && stopSuccess.success == "true") {
            var codeServer = [];
            codeServer.push('idtServer='+stopSuccess.controlRequest);
            codeServer.push('origin='+stopSuccess.origin);
            box.CONTROL_INTERVAL = setInterval(function(){
                box.ajaxJson('/virtual-machines/servers/edit/get.json', codeServer.join('&'), {
                    method: 'POST',
                    fnSuccess: function(j) {
                        var getSuccess = j.get || false;
                        var getError = j.error || false;
                        var genericError = j.genericResponse || false;
                        var sessionStatus = j.sessionStatus || false;
                        var i,
                            lenStatus;

                        // sucess
                        if(getSuccess && getSuccess.statusLabel == "STOPPED") {

                            $('dl.status dd').eq(0).html('Desligado');
                            box.enableAllElements(box.MANAGE_SERVER_ELEMENTS,[], box.MANAGE_SERVER_FLAGS, getSuccess);
                            box.hideAllMessages();

                            // verifica status dos ips adicionais
                            for (i = 0, lenStatus = getSuccess.statusAdditionalAddress.length; i < lenStatus; i++) {
                                if (getSuccess.statusAdditionalAddress[i] != "ASSIGNED") {
                                    $(".reboot span.reiniciar-servidor").addClass("hide");
                                    $(".reboot span.ligar-servidor").removeClass("hide");
                                }
                            }

                            if (!$(".reiniciar span.reiniciar-servidor").hasClass("hide")) {
                                $(".reiniciar span.ligar-servidor").removeClass("hide");
                                $(".reiniciar span.reiniciar-servidor").addClass("hide");
                            }

                            $('.solicitarIp').attr('rel','solicitarIpDesligado').removeClass('disabled');

                            if(getSuccess.origin == 'upgradedowngrade') {
                                $('#msg-updown-ok').add('#connect-server').removeClass('hide');

                            } else if(getSuccess.origin == 'changeso') {
                                $('#msg-change-so-ok').add('#connect-server').removeClass('hide');

                            } else if(getSuccess.origin == 'changeso-all') {
                                $('#msg-change-so-all-ok').add('#connect-server').removeClass('hide');

                            } else if(getSuccess.origin == 'licenses-all') {
                                $('#msg-licenses-all-ok').add('#connect-server').removeClass('hide');

                            } else if(getSuccess.origin == 'cancel') {
                                $('#msg-cancel-ok').add('#connect-server').removeClass('hide');

                            } else if(getSuccess.origin == 'cancel-all') {
                                $('#msg-cancel-all-ok').add('#connect-server').removeClass('hide');

                            } else {
                                $('#msg-disconnect-ok').add('#connect-server').removeClass('hide');
                            }

                            $('#disconnect-server').addClass('hide');

                            if (!$("#rebootIp").hasClass('hide')){
                                $("#rebootIp").addClass("hide");
                            }

                            box.parentIframeAdjust($('#container')[0].offsetHeight);
                            clearInterval(box.CONTROL_INTERVAL);
                            box.CONTROL_INTERVAL = null;
                        }
                        // error
                        box.errorHandler('#msg-disconnect-error', getError, genericError, sessionStatus, box.CONTROL_INTERVAL);
                    },
                    fnError: box.genericCallbackError
                });
            }, box.TIME_LATENCY);
        }

        // error
        box.errorHandler('#msg-disconnect-error', stopError, genericError, sessionStatus, false);
    };


    /**
    * Liga o servidor
    *
    * @method connect
    * @param {string} button identifica o botao que invocará os eventos para ligar a máquina
    * @return {undefined} este método não traz qualquer retorno
    */
    box.connect = function(button) {
        $(button).live('click', function(e){
            e.preventDefault();
            if ($(this).hasClass('disabled')) {return false;}
            $(this).addClass('disabled');

            if ($('.restart-ip .reboot .ligar-servidor').is(':visible')) {
                box.atualizaLabelIp("Definindo", ".reboot span.ligar-servidor");
            } else {
                box.atualizaLabelIp("Definindo", ".reboot span.reiniciar-servidor");
            }

            var codeServer = [];
            codeServer.push('idtServer='+$(this).attr('rel'));
            box.ajaxJson('/virtual-machines/servers/edit/connect.json', codeServer.join('&'), { method: 'POST', fnBeforeSend: box.connectWaiting, fnSuccess: box.connectSuccess, fnError: box.genericCallbackError });
        });
    };

    /**
    * Exibe uma mensagem durante o processo de ligação
    *
    * @method connectWaiting
    * @param {undefined} este método não recebe qualquer parâmetro
    * @return {undefined} este método não traz qualquer retorno
    */
    box.connectWaiting = function() {
        $('dl.status dd').eq(0).html('Ligando');
        box.disableAllElements(box.MANAGE_SERVER_ELEMENTS,['#poweroff-server','.contract-ip']);
        box.hideAllMessages();
        $('#msg-connect-wait').removeClass('hide');
        box.parentIframeAdjust($('#container')[0].offsetHeight);
    };

    /**
    * Avalia se foi possível ligar a máquina e faz um pulling que monitora a os estados e atualiza a interface
    *
    * @method connectSuccess
    * @param {object} j retorna o objeto json para manipulação
    * @return {undefined} este método não traz qualquer retorno
    */
    box.connectSuccess = function(j) {
        var startSuccess = j.start || false;
        var startError = j.error || false;
        var genericError = j.genericResponse || false;
        var sessionStatus = j.sessionStatus || false;

        // sucess
        if (startSuccess && startSuccess.success == "true") {
            var codeServer = [];
            codeServer.push('idtServer='+startSuccess.controlRequest);
            box.CONTROL_INTERVAL = setInterval(function(){
                box.ajaxJson('/virtual-machines/servers/edit/get.json', codeServer.join('&'), {
                    method: 'POST',
                    fnSuccess: function(j) {
                        var getSuccess = j.get || false;
                        var getError = j.error || false;
                        var genericError = j.genericResponse || false;
                        var sessionStatus = j.sessionStatus || false;
                        var i,
                            lenStatus;

                        //atualiza ip privado
                        if (getSuccess.rebootPrivate == "true") {
                            if (!$(".reiniciar span.ligar-servidor").hasClass('hide')) {
                                box.atualizaLabelIp('Definindo', '.reiniciar span.ligar-servidor');
                            } else {
                                box.atualizaLabelIp('Definindo', '.reiniciar span.reiniciar-servidor');
                            }
                        }
                        // atualiza mensagem do ip público
                        if (getSuccess.rebootPublicIp == "true") {
                            if (!$(".reboot span.ligar-servidor").hasClass('hide')) {
                                box.atualizaLabelIp('Definindo', '.reboot span.ligar-servidor');
                            } else {
                                box.atualizaLabelIp('Definindo', '.reboot span.reiniciar-servidor');
                            }
                        }

                        if (!$(".reiniciar span.ligar-servidor").hasClass('hide')) {
                            box.atualizaIpPrivado(getSuccess.privateAddresses, ".reiniciar span.ligar-servidor");
                        } else {
                            box.atualizaIpPrivado(getSuccess.privateAddresses, ".reiniciar span.reiniciar-servidor");
                        }

                        // sucess
                        if(getSuccess && getSuccess.statusLabel == "RUNNING") {
                            $('dl.status dd').eq(0).html('Ligado');
                            box.enableAllElements(box.MANAGE_SERVER_ELEMENTS,[], box.MANAGE_SERVER_FLAGS, getSuccess);
                            box.hideAllMessages();

                            // verifica status dos ips adicionais
                            for (i = 0, lenStatus = getSuccess.statusAdditionalAddress.length; i < lenStatus; i++) {
                                if (getSuccess.statusAdditionalAddress[i] == "ASSIGNED") {
                                    $("div.reboot").addClass("hide");
                                }
                            }
                            // verificação para ver se o ip nativo já foi criado
                            if($('.ips tbody tr:first td.central:first').text().indexOf('Definindo') >= 0){
                                var txt_td = $('.ips tbody tr:first td.central:first').html();
                                txt_td = txt_td.replace('Definindo',getSuccess.planDetails.ip);
                                $('.ips tbody tr:first td.central:first').html(txt_td);
                                $('.ips tbody tr:first td:last a').attr('rel',getSuccess.planDetails.ipId);
                            }

                            if (getSuccess.publicAddressesIp !== "") {
                                if (!$(".reiniciar span.ligar-servidor").hasClass('hide')) {
                                    box.atualizaIpPublico(getSuccess.publicAddresses, getSuccess.publicAddressesIp, getSuccess.statusAdditionalAddress);
                                } else {
                                    box.atualizaIpPublico(getSuccess.publicAddresses, getSuccess.publicAddressesIp, getSuccess.statusAdditionalAddress);
                                }
                            }

                            if (!$("#rebootIp").hasClass('hide')) {
                                $("#rebootIp").addClass("hide");
                            }

                            $('#msg-connect-ok').add('#disconnect-server').removeClass('hide');
                            $('#connect-server').addClass('hide');
                            box.parentIframeAdjust($('#container')[0].offsetHeight);
                            clearInterval(box.CONTROL_INTERVAL);
                            box.CONTROL_INTERVAL = null;
                        }

                        // error
                        box.errorHandler('#msg-connect-error', getError, genericError, sessionStatus, box.CONTROL_INTERVAL);
                    },
                    fnError: box.genericCallbackError
                });
            }, box.TIME_LATENCY);
        }

        // error
        box.errorHandler('#msg-connect-error', startError, genericError, sessionStatus, false);
    };


    /**
    * Reiniciar um servidor
    *
    * @method restart
    * @param {string} button identifica o botao que invocará os eventos para ligar a máquina
    * @return {undefined} este método não traz qualquer retorno
    */
    box.restart = function(button) {
        $(button).unbind().click(function(e) {
            e.preventDefault();
            if($(this).hasClass('disabled')) { return false; }
            //Esconde o aviso para reiniciar a maquina para aplicar Ip Privado
            $("#rebootIp").addClass("hide");

            if ($(this).hasClass('disabled')) {return false;}
            $(this).attr('href','#').addClass("disabled");
            var codeServer = [];
            codeServer.push('idtServer='+$(this).attr('rel'));
            box.ajaxJson('/virtual-machines/servers/edit/restart.json', codeServer.join('&'), { method: 'POST', fnBeforeSend: box.restartWaiting, fnSuccess: box.restartSuccess, fnError: box.genericCallbackError });
        });
    };


    /**
    * Exibe uma mensagem durante o processo de restart
    *
    * @method restartWaiting
    * @param {undefined} este método não recebe qualquer parâmetro
    * @return {undefined} este método não traz qualquer retorno
    */
    box.restartWaiting = function() {
        $('dl.status dd').eq(0).html('Reiniciando');
        box.disableAllElements(box.MANAGE_SERVER_ELEMENTS,['#poweroff-server','.contract-ip']);
        box.hideAllMessages();
        $('#msg-restart-wait').removeClass('hide');
        box.parentIframeAdjust($('#container')[0].offsetHeight);
    };

    /**
    * Avalia se a API conseguiu reiniciar o servidor e exibe uma mensagem
    *
    * @method restartSuccess
    * @param {object} j retorna o objeto json para manipulação
    * @return {undefined} este método não traz qualquer retorno
    */
    box.restartSuccess = function(j) {
        var restartSuccess = j.restart || false;
        var restartError = j.error || false;
        var genericError = j.genericResponse || false;
        var sessionStatus = j.sessionStatus || false;

        //box.atualizaLabelIp("Definindo", ".reiniciar span.reiniciar-servidor");

        // sucess
        if (restartSuccess && restartSuccess.success == "true") {
            var codeServer = [];
            codeServer.push('idtServer='+restartSuccess.controlRequest);
            box.CONTROL_INTERVAL = setInterval(function(){
                box.ajaxJson('/virtual-machines/servers/edit/get.json', codeServer.join('&'), {
                    method: 'POST',
                    fnSuccess: function(j) {
                        var getSuccess = j.get || false;
                        var getError = j.error || false;
                        var genericError = j.genericResponse || false;
                        var sessionStatus = j.sessionStatus || false;
                        var i,
                            lenStatus;

                        //atualiza ip privado
                        if (getSuccess.rebootPrivate == "true") {
                            if (!$(".reiniciar span.ligar-servidor").hasClass('hide')) {
                                box.atualizaLabelIp('Definindo', '.reiniciar span.ligar-servidor');
                            } else {
                                box.atualizaLabelIp('Definindo', '.reiniciar span.reiniciar-servidor');
                            }
                        }

                        if (getSuccess.rebootPublicIp == "true") {
                            if (!$(".reboot span.ligar-servidor").hasClass('hide')) {
                                box.atualizaLabelIp('Definindo', '.reboot span.ligar-servidor');
                            } else {
                                box.atualizaLabelIp('Definindo', '.reboot span.reiniciar-servidor');
                            }
                        }

                        if (!$(".reiniciar span.ligar-servidor").hasClass('hide')) {
                            box.atualizaIpPrivado(getSuccess.privateAddresses, ".reiniciar span.ligar-servidor");
                        } else {
                            box.atualizaIpPrivado(getSuccess.privateAddresses, ".reiniciar span.reiniciar-servidor");
                        }

                        // sucess
                        if(getSuccess && getSuccess.statusLabel == "RUNNING") {
                            $('dl.status dd').eq(0).html('Ligado');
                            box.enableAllElements(box.MANAGE_SERVER_ELEMENTS,[], box.MANAGE_SERVER_FLAGS, getSuccess);
                            box.hideAllMessages();
                            $('#msg-restart-ok').add('#disconnect-server').removeClass('hide');
                            $('#connect-server').addClass('hide');

                            // verifica status dos ips adicionais
                            for (i = 0, lenStatus = getSuccess.statusAdditionalAddress.length; i < lenStatus; i++) {
                                if (getSuccess.statusAdditionalAddress[i] == "ASSIGNED") {
                                    $(".reboot").addClass("hide");
                                }
                            }
                            // verificação para ver se o ip nativo já foi criado
                            if($('.ips tbody tr:first td.central:first').text().indexOf('Definindo') >= 0){
                                var txt_td = $('.ips tbody tr:first td.central:first').html();
                                txt_td = txt_td.replace('Definindo', getSuccess.planDetails.ip);
                                $('.ips tbody tr:first td.central:first').html(txt_td);
                                $('.ips tbody tr:first td:last a').attr('rel',getSuccess.planDetails.ipId);
                            }
                            if (getSuccess.publicAddressesIp !== ""){
                                if (!$(".reiniciar span.ligar-servidor").hasClass('hide') && $(".reiniciar span.ligar-servidor").size() >= 1){
                                    box.atualizaIpPublico(getSuccess.publicAddresses,getSuccess.publicAddressesIp,getSuccess.statusAdditionalAddress);
                                    // $("#solicitarIp").addClass("hide");
                                }else{
                                    box.atualizaIpPublico(getSuccess.publicAddresses,getSuccess.publicAddressesIp,getSuccess.statusAdditionalAddress);
                                    // $("#solicitarIp").addClass("hide");
                                }
                            }

                            box.parentIframeAdjust($('#container')[0].offsetHeight);
                            clearInterval(box.CONTROL_INTERVAL);
                            box.CONTROL_INTERVAL = null;
                        }
                        // error
                        box.errorHandler('#msg-restart-error', getError, genericError, sessionStatus, box.CONTROL_INTERVAL);
                    },
                    fnError: box.genericCallbackError
                });
            }, box.TIME_LATENCY);
        }

        // error
        box.errorHandler('#msg-restart-error', restartError, genericError, sessionStatus, false);
    };


    /**
    * Conecta um disco a máquina atual através de uma lista
    *
    * @method attachDisk
    * @param {string} button identifica o(s) botao(oe) que invocará os eventos para conectar um disco
    * @return {undefined} este método não traz qualquer retorno
    */
    box.attachDisk = function(button) {
        $(button).unbind().click(function(e){
            e.preventDefault();
            if ($(this).hasClass('disabled')) {return false;}
            tb_show('Conectar Disco','#TB_inline?height=210&width=560&inlineId=attach-detach&modal=false', null);
            $('.enable-choice').removeClass('hide');
            $('.disable-choice').add('.not-machine').addClass('hide');
            $('a.connect').attr('rel', $(this).attr('rel'));
            box.heightModal();

            box.centralizeButtons('#TB_ajaxContent .actions', '#TB_ajaxContent', '.actions:visible .connect',
                                '.actions:visible .close');
            // popula o combo
            box.getComboDisks();

            // conectar disco
            $('.connect').unbind().click(function(e) {
                e.preventDefault();
                if ($(this).hasClass('disabled')) {return false;}
                $(this).attr('href','#').addClass("disabled");

                // validacao
                if(parseInt($('#fieldMachine option:selected').val(), 10) !== 0) {
                    var codeServer = [];
                    codeServer.push('idtDisk=' + $('#fieldMachine option:selected').val());
                    codeServer.push('idtServer=' + $(this).attr('rel'));
                    box.ajaxJson('/virtual-machines/disks/attach-detach/attach.json',
                        codeServer.join('&'),
                        {
                            method: 'POST',
                            fnBeforeSend: box.attachWaiting,
                            fnSuccess: box.attachSuccess,
                            fnError: box.genericCallbackError
                        }
                    );
                } else {
                    $('.not-machine').removeClass('hide');
                    $('.connect').removeClass('disabled').attr('href','#');
                    return false;
                }
            });


            // fechar lightbox
            $('a.close').add('a#TB_closeWindowButton').add('#TB_overlay').unbind().click(function() {
                tb_remove();
                box.heightModal();
            });
        });
    };

    /**
    * Exibe uma mensagem durante o processo de conexão do disco
    *
    * @method attachWaiting
    * @param {undefined} este método não recebe qualquer parâmetro
    * @return {undefined} este método não traz qualquer retorno
    */
    box.attachWaiting = function() {
        box.disableAllElements(box.MANAGE_SERVER_ELEMENTS,['#poweroff-server']);
        box.hideAllMessages();
        $('#msg-attach-wait').removeClass('hide');
        $('.external-disks').not('.hide').addClass('hide');
        $('.external-disks.connecting').removeClass('hide');
        box.parentIframeAdjust($('#container')[0].offsetHeight);
    };


    /**
    * Avalia se a API conseguiu conectar um disco e exibe uma mensagem
    *
    * @method attachSuccess
    * @param {object} j retorna o objeto json para manipulação
    * @return {undefined} este método não traz qualquer retorno
    */
    box.attachSuccess = function(j) {
        var attachSuccess = j.attach || false;
        var attachError = j.error || false;
        var genericError = j.genericResponse || false;
        var sessionStatus = j.sessionStatus || false;

        // sucess
        if (attachSuccess && attachSuccess.success == "true") {
            var codeServer = [];
            codeServer.push('idtDisk='+attachSuccess.controlRequest);
            codeServer.push('idtServer='+$('.attach-disk').attr('rel'));
            box.CONTROL_ATTACH = setInterval(function(){
                box.ajaxJson('/virtual-machines/disks/attach-detach/get.json', codeServer.join('&'), {
                    method: 'POST',
                    fnSuccess: function(j) {
                        var getSuccess = j.get || false;
                        var getError = j.error || false;
                        var genericError = j.genericResponse || false;
                        var sessionStatus = j.sessionStatus || false;

                        // sucess
                        if(getSuccess && getSuccess.disk_status == "ATTACHED") {
                            $('.external-disks').not('.hide').addClass('hide');
                            $('.external-disks.diskattach').removeClass('hide');

                            var newDisk = '<dd id="extdisk-'+getSuccess.disk_id+'">'+getSuccess.disk_name+' <span>('+getSuccess.disk_capacity+') - </span> <a href="#" class="detach-free-disk" rel="'+getSuccess.disk_id+'" title="desconectar" alt="desconectar">desconectar</a></dd>';

                            if($('.external-disks.diskattach dd').not('.button').length === 0) {
                                $('.external-disks.diskattach dt').after(newDisk);
                            } else {
                                $('.external-disks.diskattach dd.button').before(newDisk);
                            }

                            box.enableAllElements(box.MANAGE_SERVER_ELEMENTS,[], box.MANAGE_SERVER_FLAGS, getSuccess);
                            box.detachFreeDisk('.detach-free-disk');
                            box.hideAllMessages();
                            $('#msg-attach-ok').removeClass('hide');

                            if (getSuccess.activeFreeStorageVolumes && getSuccess.storageVolumes) {
                                $('.attach-disk').text('Conectar outro');
                                $('.attach-disk').removeClass('hide');
                                $('.contract-disk').addClass('hide');
                            } else if (getSuccess.activeFreeStorageVolumes && !getSuccess.storageVolumes) {
                                $('.attach-disk').text('Conectar disco');
                                $('.attach-disk').removeClass('hide');
                                $('.contract-disk').addClass('hide');
                            } else {
                                $('.attach-disk').addClass('hide');
                                $('.contract-disk').removeClass('hide');
                            }

                            // links agendamento backup
                            $('#create-scheduling').removeClass('disabled');
                            $('#change-scheduling').removeClass('disabled');
                            $('.cancel-request').removeClass('disabled');
                            box.copyHeight('.access', '.external-disks');

                            box.parentIframeAdjust($('#container')[0].offsetHeight);
                            clearInterval(box.CONTROL_ATTACH);
                            delete box.CONTROL_ATTACH;
                        }

                        // error
                        box.errorHandler('#msg-attach-error', getError, genericError, sessionStatus, box.CONTROL_INTERVAL);

                    },
                    fnError: box.genericCallbackError
                });
            }, box.TIME_LATENCY);
        }

        // error
        box.errorHandler('#msg-attach-error', attachError, genericError, sessionStatus, false);
    };

    /**
    * Popula o combo de discos dinamicamente
    *
    * @method getComboDisks
    * @param {undefined} este método não recebe qualquer parâmetro
    * @return {undefined} este método não traz qualquer retorno
    */
    box.getComboDisks = function() {
        // popula o combo
        var codeServer = ['param=false'];
        box.ajaxJson('/virtual-machines/disks/attach-detach/get-disks.json', codeServer.join('&'), {
            method: 'POST',
            fnBeforeSend: function() {
                $('#fieldMachine').attr('disabled','disabled').addClass('inactive');
                $('#fieldMachine option').html("Carregando...");
            },
            fnSuccess: function(j){
                var getDisks = j.disk || false;
                var getDisksError = j.error || false;
                var genericError = j.genericResponse || false;
                var sessionStatus = j.sessionStatus || false;
                var i;

                // success
                if(getDisks) {
                    $('#fieldMachine option').remove();
                    $('#fieldMachine').append('<option value="0">Selecione o disco</option>');
                    for(i=0;i<j.disk.length;i++) {
                        if (j.disk[i].statusLabel != 'CONFIRMING_PAYMENT') {
                            if(j.disk[i].statusLabel != 'INSTALLATION_ERROR') {
                                if (j.disk[i].disabled == "true") {
                                    $('#fieldMachine').append('<option value="' + j.disk[i].id + '" disabled="disabled">' + j.disk[i].name + ' - Conectado</option>');
                                } else {
                                    $('#fieldMachine').append('<option value="' + j.disk[i].id + '">' + j.disk[i].name + '</option>');
                                }
                            }
                        } else {
                            $('#fieldMachine').append('<option value="' + j.disk[i].id + '" disabled="disabled">' + j.disk[i].name + ' - Aguardando confirmação</option>');
                        }
                    }
                    $('#fieldMachine').removeAttr('disabled').removeClass('inactive');
                    $('a.connect').removeClass('disabled');
                }

                // error
                box.errorHandler('#msg-attach-error', getDisksError, genericError, sessionStatus, false);
            },
            fnError: box.genericCallbackError
        });

        // exibe mensagem de erro conforme escolha do combo
        $('#fieldMachine').unbind().change(function() {
            if($(this).val() !== 0) {
                if(!$('.not-machine').hasClass('hide')) { $('.not-machine').addClass('hide'); }
            } else {
                if($('.not-machine').hasClass('hide')) { $('.not-machine').removeClass('hide'); }
            }
        });
    };


    /**
    * Desconecta um disco da máquina atual
    *
    * @method detachFreeDisk
    * @param {string} button identifica o(s) botao(oe) que invocará os eventos para conectar um disco
    * @return {undefined} este método não traz qualquer retorno
    */
    box.detachFreeDisk = function(button) {
        $(button).on("click", function (e) {
            e.preventDefault();
            if ($(this).hasClass('disabled')) {return false;}
            tb_show('Desconectar Disco','#TB_inline?height=210&width=560&inlineId=attach-detach&modal=false',null);
            $('.disable-choice').removeClass('hide');
            $('.enable-choice').addClass('hide');
            $('a.disconnect').attr('rel',$(this).attr('rel'));
            box.heightModal();

            box.centralizeButtons('#TB_ajaxContent .actions', '#TB_ajaxContent', '.actions:visible .disconnect',
                                '.actions:visible .close');
            // desconectar
            $('a.disconnect').unbind().click(function() {
                var codeServer = [];
                codeServer.push('idtDisk='+$(this).attr('rel'));
                $('#extdisk-'+$(this).attr('rel')).addClass('disabled');
                $('.external-disks dd.item a').unbind();
                box.ajaxJson('/virtual-machines/disks/attach-detach/detach.json',
                    codeServer.join('&'),
                    {
                        method: 'POST',
                        fnBeforeSend: box.detachFreeDiskWaiting,
                        fnSuccess: box.detachFreeDiskSuccess,
                        fnError: box.genericCallbackError
                    }
                );
            });

            // fechar lightbox
            $('a.close').add('a#TB_closeWindowButton').add('#TB_overlay').unbind().click(function() {
                tb_remove();
                box.heightModal();
            });
        });
    };

    /**
    * Exibe uma mensagem durante o processo de desconexão
    *
    * @method detachFreeDiskWaiting
    * @param {undefined} este método não recebe qualquer parâmetro
    * @return {undefined} este método não traz qualquer retorno
    */
    box.detachFreeDiskWaiting = function(j) {
        box.disableAllElements(box.MANAGE_SERVER_ELEMENTS,['#poweroff-server']);
        box.hideAllMessages();
        $('#msg-detach-wait').removeClass('hide');
        box.parentIframeAdjust($('#container')[0].offsetHeight);

    };

    /**
    * Avalia se a API conseguiu desconectar um disco e exibe uma mensagem
    *
    * @method detachFreeDiskSuccess
    * @param {object} j é o objeto json para manipulação
    * @return {undefined} este método não traz qualquer retorno
    */
    box.detachFreeDiskSuccess = function(j) {
        var detachSuccess = j.detach || false;
        var detachError = j.error || false;
        var genericError = j.genericResponse || false;
        var sessionStatus = j.sessionStatus || false;

        // sucess
        if (detachSuccess && detachSuccess.success == "true") {
            var codeServer = [];
            codeServer.push('idtDisk=' + detachSuccess.controlRequest);
            codeServer.push('idtServer=' + $('#fieldvalue').val());

            box.CONTROL_DETACH = setInterval(function(){
                box.ajaxJson('/virtual-machines/disks/attach-detach/get.json', codeServer.join('&'), {
                    method: 'POST',
                    fnSuccess: function(j) {
                        var getSuccess = j.get || false;
                        var getError = j.error || false;
                        var genericError = j.genericResponse || false;
                        var sessionStatus = j.sessionStatus || false;

                        // sucess
                        if(getSuccess && getSuccess.disk_status == "DETACHED") {
                            $('#extdisk-'+getSuccess.disk_id).slideUp('slow', function() {
                                $('#extdisk-'+getSuccess.disk_id).remove();
                                box.hideAllMessages();
                                $('#msg-detach-ok').removeClass('hide');

                                // exibe mensagem caso nao tenha mais discos
                                if($('.external-disks.diskattach dd').not('.button').length === 0) {
                                    $('.external-disks').not('.hide').addClass('hide');
                                    $('.external-disks.diskless').removeClass('hide');
                                }
                            });

                            if (getSuccess.activeFreeStorageVolumes && getSuccess.storageVolumes) {
                                $('.attach-disk').text('Conectar outro');
                                $('.attach-disk').removeClass('hide');
                                $('.contract-disk').addClass('hide');
                            } else if (getSuccess.activeFreeStorageVolumes && !getSuccess.storageVolumes) {
                                $('.attach-disk').text('Conectar disco');
                                $('.attach-disk').removeClass('hide');
                                $('.contract-disk').addClass('hide');
                            } else {
                                $('.attach-disk').addClass('hide');
                                $('.contract-disk').removeClass('hide');
                            }

                            // links agendamento backup
                            $('#create-scheduling').removeClass('disabled');
                            $('#change-scheduling').removeClass('disabled');
                            $('.cancel-request').removeClass('disabled');
                            box.copyHeight('.access', '.external-disks');

                            box.enableAllElements(box.MANAGE_SERVER_ELEMENTS,[], box.MANAGE_SERVER_FLAGS, getSuccess);
                            clearInterval(box.CONTROL_DETACH);
                        }

                        // error
                        box.errorHandler('#msg-detach-error', getError, genericError, sessionStatus, box.CONTROL_INTERVAL);

                    },
                    fnError: box.genericCallbackError
                });
            }, box.TIME_LATENCY);
        }
        // error
        box.errorHandler('#msg-detach-error', detachError, genericError, sessionStatus, false);
    };

    /**
    * Força o desligamento do servidor
    *
    * @method powerOff
    * @param {type} description
    * @return {type} description
    */
    box.powerOff = function(button) {
        $(button).unbind().click(function(e){
            e.preventDefault();
            if ($(this).hasClass('disabled')) { return false; }
            $(this).attr('href','#').addClass("disabled");
            var codeServer = [];
            codeServer.push('idtServer='+$(this).attr('rel'));
            box.ajaxJson('/virtual-machines/servers/power-off/power_off.json', codeServer.join('&'), { method: 'POST', fnBeforeSend: box.powerOffWaiting, fnSuccess: box.powerOffSuccess, fnError: box.genericCallbackError });
        });
    };

    /**
    * lightbox para aguardar o desligamento
    *
    * @method powerOffWaiting
    * @param {object} j retorna o objeto json para manipulação
    * @return {undefined} este método não traz qualquer retorno
    */
    box.powerOffWaiting = function(j) {
        tb_show('Desligando...','#TB_inline?height=115&width=450&inlineId=msgWait&modal=true',null);
        box.heightModal();
    };

    /**
    * Avalia se a API conseguiu desligar o servidor a força e exibe uma mensagem
    *
    * @method powerOffSuccess
    * @param {object} j retorna o objeto json para manipulação
    * @return {undefined} este método não traz qualquer retorno
    */
    box.powerOffSuccess = function(j) {
        var powerOffSuccess = j.powerOff || false;
        var powerOffError = j.error || false;
        var genericError = j.genericResponse || false;
        var sessionStatus = j.sessionStatus || false;

        if (powerOffSuccess && powerOffSuccess.success == "true") {
            $('#fieldvalue').val(powerOffSuccess.controlRequest);
            $('#fieldmessage').val('api-stop-success');
        }

        if (powerOffError && powerOffError.exception == "true") {
            $('#fieldvalue').val(powerOffError.controlRequest);
            $('#fieldmessage').val('api-stop-error');

        }

        if (genericError && genericError.request == 'fail') {
            $('#fieldvalue').val(genericError.controlRequest);
            $('#fieldmessage').val('req-stop-error');
        }

        if (sessionStatus && sessionStatus.expired == "true") {
            top.location = box.EXPIRED_URL;
        } else {
            $('#fieldaction').val('edit-server');
            $('form:first').submit();
        }
    };

    /**
    * Envia o usuário para o fluxo de cancelamento
    *
    * @method cancelPlan
    * @param {string} button identifica o(s) botao(oe) que invocará os eventos para cancelar o plano
    * @return {undefined} este método não traz qualquer retorno
    */
    box.cancelPlan = function(button) {
        $(button).unbind().click(function(e){
            e.preventDefault();
            if ($(this).hasClass('disabled')) {return false;}
            $(this).attr('href','#').addClass("disabled");

            var codeServer = [];
            codeServer.push('idtServer='+$(this).attr('rel'));
            box.ajaxJson('/virtual-machines/servers/edit/get.json', codeServer.join('&'), { method: 'POST', fnSuccess: box.cancelPlanSuccess, fnError: box.genericCallbackError });
        });
    };

    /**
    * Verifica se a máquina esta desligada, antes de enviar o usuário para o fluxo de cancelamento
    *
    * @method cancelPlanSuccess
    * @param {object} j retorna o objeto json para manipulação
    * @return {undefined} este método não traz qualquer retorno
    */
    box.cancelPlanSuccess = function(j) {
        var getSuccess = j.get || false;
        var getError = j.error || false;
        var genericError = j.genericResponse || false;
        var sessionStatus = j.sessionStatus || false;

        // success
        if(getSuccess && getSuccess.statusLabel == 'STOPPED' && parseInt(getSuccess.attachedDisks, 10) === 0) {
            $('#manage #fieldaction').val($('#cancel-server').attr('id'));
            $('#manage #fieldvalue').val($('#cancel-server').attr('rel'));
            $('#manage').attr('action',$('#cancel-server').attr('rev')).submit();
            // return false;
        } else {
            $('.cancel-choice').children('div').addClass('hide');
            tb_show('Atenção','#TB_inline?height=210&width=560&inlineId=cancel-plan&modal=false',null);
            box.heightModal();
            $('a.disconnect-server').add('a.disconnect-disks').attr('rel', getSuccess.controlRequest);

            if(getSuccess.statusLabel == 'RUNNING' && parseInt(getSuccess.attachedDisks, 10) === 0) {
                $('.cancel-disconnect').removeClass('hide');
                box.centralizeButtons('#TB_ajaxContent .enable-choice .actions', '#TB_ajaxContent', '.actions:visible .disconnect-server', '.actions:visible .close');
                box.disconnect('.disconnect-server','cancel');
            } else if(getSuccess.statusLabel == 'RUNNING' && parseInt(getSuccess.attachedDisks, 10) > 0) {
                $('.cancel-disconnect-all').removeClass('hide');
                box.disconnect('.disconnect-server','cancel-all');
                box.dispatcherDetachDisks('#msg-cancel-all-ok a');
            } else if(getSuccess.statusLabel == 'STOPPED' && parseInt(getSuccess.attachedDisks, 10) > 0) {
                $('.cancel-disconnect-disks').removeClass('hide');
                box.dispatcherDetachDisks('.disconnect-disks');
            }

            box.centralizeButtons('#TB_ajaxContent .actions', '#TB_ajaxContent', '.actions:visible .btn:first',
                                '.actions:visible .close');
            // fechar lightbox
            $('a.close').add('a#TB_closeWindowButton').add('#TB_overlay').unbind().click(function(e) {
                e.preventDefault();
                tb_remove();
                $('#cancel-server').attr('href','#').removeClass('disabled');
                box.heightModal();
            });
        }

        // error
        box.errorHandler('#msg-updown-error', getError, genericError, sessionStatus, false);
    };

    /**
    * Envia o usuário para o fluxo de alteração de SO
    *
    * @method changeOperatingSystem
    * @param {string} button identifica o(s) botao(oe) que invocará os eventos para alterar o SO
    * @return {undefined} este método não traz qualquer retorno
    */
    box.changeOperatingSystem = function(button) {
        $(button).unbind().click(function(e){
            e.preventDefault();
            if ($(this).hasClass('disabled')) {return false;}
            $(this).attr('href','#').addClass("disabled");

            var codeServer = [];
            codeServer.push('idtServer='+$(this).attr('rel'));
            box.ajaxJson('/virtual-machines/servers/edit/get.json', codeServer.join('&'), { method: 'POST', fnSuccess: box.changeOperatingSystemSuccess, fnError: box.genericCallbackError });
        });
    };

    /**
    * Verifica se a máquina esta desligada e com discos desconectados, antes de enviar o usuário para o fluxo de upgrade / downgrade
    *
    * @method changeOperatingSystemSuccess
    * @param {object} j retorna o objeto json para manipulação
    * @return {undefined} este método não traz qualquer retorno
    */
    box.changeOperatingSystemSuccess = function(j) {
        var getSuccess = j.get || false;
        var getError = j.error || false;
        var genericError = j.genericResponse || false;
        var sessionStatus = j.sessionStatus || false;

        // success
        if(getSuccess && (getSuccess.statusLabel == 'STOPPED' || getSuccess.statusLabel == 'SLOT')  && parseInt(getSuccess.attachedDisks, 10) === 0) {
            $('#manage #fieldaction').val($('#modify-os').attr('id'));
            $('#manage #fieldvalue').val($('#modify-os').attr('rel'));
            $('#manage').attr('action',$('#modify-os').attr('rev')).submit();
            // return false;
        } else {
            $('.change-choice').children('div').addClass('hide');
            tb_show('Alterar ou reinstalar template', '#TB_inline?height=210&width=560&inlineId=change-so&modal=false',null);
            box.heightModal();
            $('a.disconnect-server').add('a.disconnect-disks').attr('rel',getSuccess.controlRequest);

            if(getSuccess.statusLabel == 'RUNNING' && parseInt(getSuccess.attachedDisks, 10) === 0) {
                $('.changeso-disconnect').removeClass('hide');
                box.disconnect('.disconnect-server','changeso');
            } else if(getSuccess.statusLabel == 'RUNNING' && parseInt(getSuccess.attachedDisks, 10) > 0) {
                $('.changeso-disconnect-all').removeClass('hide');
                box.disconnect('.disconnect-server','changeso-all');
                box.dispatcherDetachDisks('#msg-change-so-all-ok a');
            } else if(getSuccess.statusLabel == 'STOPPED' && parseInt(getSuccess.attachedDisks, 10) > 0) {
                $('.changeso-disconnect-disks').removeClass('hide');
                box.dispatcherDetachDisks('.disconnect-disks');
            }

            box.centralizeButtons('#TB_ajaxContent .actions', '#TB_ajaxContent', '.actions:visible .btn:first',
                                '.actions:visible .close');
            // fechar lightbox
            $('a.close').add('a#TB_closeWindowButton').add('#TB_overlay').unbind().click(function() {
                tb_remove();
                $('#modify-os').removeClass('disabled');
                box.heightModal();
            });
        }

        // error
        box.errorHandler('#msg-updown-error', getError, genericError, sessionStatus, false);
    };

    /**
    * Envia o usuário para o fluxo de alteração de SO
    *
    * @method acessApp
    * @param {string} button identifica o(s) botao(oe) que invocará os eventos para acessar o Aplicativo
    * @return {undefined} este método não traz qualquer retorno
    */
    box.acessApp = function(button) {
        $(button).unbind().click(function(e){
            e.preventDefault();
            if ($(this).hasClass('disabled')) {return false;}
            var ip = $(this).attr("rel");
            var prd = $.trim($(this).attr("rev"));
            var width = screen.width,
                height = screen.height,
                wdt = width-(width/100*20),
                hgt = height-(height/100*20),
                tp = (height-hgt) / 2,
                lt = (width-wdt) / 2,
                params = 'scrollbars=yes,width='+wdt+',height='+hgt+',top='+tp+',left='+lt;
            var url = "http://" + ip + "/install/" + prd;

            open(url, '_blank', params, false);
            return false;
        });
    };

    /**
    * Enfilera chamadas para remoção de discos
    *
    * @method dispatcherDetachDisks
    * @param {string} button identifica o(s) botao(oe) que invocará os eventos para desconectar discos
    * @return {undefined} este método não traz qualquer retorno
    */
    box.dispatcherDetachDisks = function(button) {
        $(button).unbind().click(function() {
            // desconectar discos
            var codeDisk = [];
            $('a.detach-free-disk').each(function() {
                codeDisk.push($(this).attr('rel'));
            });

            // enfilera chamadas de desconexao
            var dispatcher = setInterval(function() {
                if(box.CONTROL_DETACH === undefined && codeDisk.length > 0) {
                    var codeServer = [];
                    codeServer.push('idtDisk='+codeDisk[0]);
                    $('#extdisk-'+codeDisk[0]).addClass('disabled');
                    codeDisk.shift();
                    box.ajaxJson('/virtual-machines/disks/attach-detach/detach.json', codeServer.join('&'), { method: 'POST', fnBeforeSend: box.detachFreeDiskWaiting, fnSuccess: box.detachFreeDiskSuccess, fnError: box.genericCallbackError });
                } else {
                    if(box.CONTROL_DETACH === undefined && codeDisk.length === 0) {
                        clearInterval(dispatcher);
                    }
                }
            }, 500);
        });
    };

    /**
    * Controla exibição de conteúdo de backup agendado
    *
    * @method controlBackupType
    * @param {string} controlBackupType é o radio que receberá ação de click
    * @return {undefined} este método não traz qualquer retorno
    */
    box.controlBackupType = function (backupType) {
        $(backupType).click(function () {
            if ($(backupType + ':checked').val() !== "immediate") {
                $('.schedule-component').slideDown();
                box.createCalendar('.input-scheduling');
                $('.form-inputs .lbl-immediate').removeClass('lbl-bold');
                $('.form-inputs .lbl-schedule').addClass('lbl-bold');
            } else {
                $('.form-inputs .lbl-immediate').addClass('lbl-bold');
                $('.form-inputs .lbl-schedule').removeClass('lbl-bold');
                $('.schedule-component').slideUp();
            }
        });
    };

    /**
    * Valida se a data é uma data válida
    *
    * @method checkDate
    * @param {string} recebe os parametros dia, mes e ano para validar
    * @return {string} isImmediate retorna qual foi o backup selecionado pelo usuário
    */
    box.checkDate = function(dia, mes, ano) {
        try {
            dia = parseInt(dia,10);
            mes = parseInt(mes,10);
            ano = parseInt(ano,10);
        } catch (e) {
            return false;
        }

        if (dia < 1 || dia > 31 || mes < 1 || mes > 12 || isNaN(ano) || isNaN(mes) || isNaN(dia)) {
            return false;
        }
        if (dia <= 28) {
            return true;
        }
        if (mes === 2) {
            return dia === 29 && ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0);
        }
        if (dia <= 30) {
            return true;
        }
        return mes !== 4 && mes !== 6 && mes !== 9 && mes !== 11;
    };

    /**
    * Valida os campos do modal de acordo com tipo de backup selecionado
    *
    * @method validateCreate
    * @param {string} typeBackup identifica qual foi o backup selecionado pelo usuário
    * @return {string} isImmediate retorna qual foi o backup selecionado pelo usuário
    */
    box.validateCreateBackup = function (typeBackup) {
        var isImmediate  = typeBackup,
            bkpName      = ($('#TB_ajaxContent #backupName').length !== 0) ? $('#TB_ajaxContent #backupName').val() : false, // nome backup
            date         = $('#TB_ajaxContent .input-scheduling').val(); // data de agendamento
            date = date.split('/');

        // backup imediato
        if (isImmediate === "immediate") {
            if ($.trim(bkpName).length === 0) {
                $('#name-alert').removeClass('hide');
                return false;
            }
        // backup agendado
        } else {
            if ($.trim(bkpName).length === 0 && !box.checkDate(date[0],date[1],date[2])) {
                $('#TB_ajaxContent #name-alert').removeClass('hide');
                $('#TB_ajaxContent #schedule-alert').removeClass('hide');
                return false;
            }

            if ($.trim(bkpName).length === 0 && bkpName !== false) {
                $('#TB_ajaxContent #name-alert').removeClass('hide');
                $('#TB_ajaxContent #schedule-alert').addClass('hide');
                return false;
            }

            if (!box.checkDate(date[0],date[1],date[2])){
                $('#TB_ajaxContent #schedule-alert').removeClass('hide');
                $('#TB_ajaxContent #name-alert').addClass('hide');
                return false;
            }
        }
        return isImmediate;
    };

    /**
    * Efetua reset dos campos do modal
    *
    * @method resetModalsBackup
    * @param {undefined} este método não recebe qualquer parâmetro
    * @return {undefined} este método não traz qualquer retorno
    */
    box.resetModalsBackup = function () {
        $('#TB_ajaxContent .schedule-component').hide();
        $('#TB_ajaxContent .input-scheduling').val('');
        $('#TB_ajaxContent #name-alert').addClass('hide');
        $('#TB_ajaxContent #schedule-alert').addClass('hide');
        $('#TB_ajaxContent #check-immediate').attr('checked', 'checked');
        $('#TB_ajaxContent .open-schedule .actual').text('00:00');
        $('#TB_ajaxContent .open-recurrence .actual').text('Sem recorrência');
        $('#TB_ajaxContent .open-schedule input[name^=data]').val('00:00');
        $('#TB_ajaxContent .open-recurrence input[name^=data]').val('ONCE');
    };

    /**
    * Controla exibição de conteúdo de backup agendado
    *
    * @method getToday
    * @param {string} today recebe data atual do velocity
    * @return {undefined} este método não traz qualquer retorno
    */
    box.getToday = function (today) {
        return today.replace(/-/g, '/');
    };

    /**
    * Controla exibição de conteúdo de backup agendado
    *
    * @method createCalendar
    * @param {string} input é o campo que inicializa o datepicker
    * @return {undefined} este método não traz qualquer retorno
    */
    box.createCalendar = function (input) {
        // tradução do plugin de calendário
        $(input).datepicker({
            dateFormat: 'dd/mm/yy',
            dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
            dayNamesMin: ['DOM','SEG','TER','QUA','QUI','SEX','SAB','DOM'],
            dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],
            monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
            monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
            nextText: 'Próximo',
            prevText: 'Anterior',
            // regra para datas que podem ser selecionadas
            minDate: box.getToday($('.select-recurrence input[name^=today]').val()), // date velocity
            showOn: "button",
            buttonImage: "/_assets/build/img/ico/calendar-backup.png",
            buttonImageOnly: true,
            buttonText: "Selecione a data inicial",
            showButtonPanel: true,
            currentText: "Hoje"
        });
    };

    /**
    * Envia o usuário para o fluxo de criação de backup
    *
    * @method createBackup
    * @param {string} button identifica o(s) botao(oe) que invocará os eventos para criar o backup
    * @return {undefined} este método não traz qualquer retorno
    */
    box.createBackup = function(button) {
        $(button).live('click', function(e) {
            e.preventDefault();
            if ($(this).hasClass('disabled')) {return false;}
            $(this).attr('href','#').addClass("disabled");
            var idtServer = $(this).attr('rel').match(/-?\d/gi);
            var idtSlot = $(this).attr('rev').match(/\d/gi);

            var backupData = [];
            backupData.push('idtServer='+idtServer.join(''));
            box.ajaxJson('/virtual-machines/servers/edit/get.json', backupData.join('&'), {
                method: 'POST',
                fnSuccess: function(j) {
                    var getSuccess = j.get || false;
                    var getError = j.error || false;
                    var genericError = j.genericResponse || false;
                    var sessionStatus = j.sessionStatus || false;


                    if (getSuccess) {
                        $('.create-backup #backupName').add('.create-backup #backupDescription').val('');
                        box.limitTextarea('.create-backup textarea[maxlength]');

                        if(idtServer && idtSlot) {
                            tb_show('Criar backup', '#TB_inline?height=450&width=556&inlineId=create-backup&modal=false', null);
                            box.resetModalsBackup();
                            box.selectPersonalizados('#TB_ajaxContent .open-schedule');
                            box.selectPersonalizados('#TB_ajaxContent .open-recurrence');
                            box.heightModal();
                            $('.form-immediate').addClass('hide');
                            $('.form-create-backup').removeClass('hide');
                            box.centralizeButtons('#TB_ajaxContent .actions', '#TB_ajaxContent', '.actions:visible .create',
                                '.actions:visible .close');
                            $('#backupName').focus();
                            $('.form-inputs .lbl-immediate').addClass('lbl-bold');
                            $('.form-inputs .lbl-schedule').removeClass('lbl-bold');

                            $('a.create').unbind().click(function() {
                                var isImmediate = $('#TB_ajaxContent .type-backup:checked').val(),
                                    backupData  = [],
                                    dateToSchedule = $('#TB_ajaxContent .input-scheduling').val().split('/');

                                // backup imediato
                                if (box.validateCreateBackup(isImmediate) === "immediate") {
                                    backupData.push('idtServer=' + idtServer.join(''));
                                    backupData.push('idtSlot=' + idtSlot.join(''));
                                    backupData.push('nameSlot=' + encodeURI(box.validateName($('#backupName').val())));
                                    backupData.push('descriptionSlot=' + encodeURI($.trim($('#backupDescription').val())));
                                    box.ajaxJson('/virtual-machines/servers/edit/backup/create.json',
                                        backupData.join('&'),
                                        {
                                            method: 'POST',
                                            fnBeforeSend: box.backupWaiting,
                                            fnSuccess: box.createBackupSuccess,
                                            fnError: box.genericCallbackError
                                        });
                                // backup agendado
                                } else if(box.validateCreateBackup(isImmediate) === "schedule") {
                                    backupData.push('idtBkp=' + idtSlot.join(''));
                                    backupData.push('nameSlot=' + encodeURI(box.validateName($('#TB_ajaxContent #backupName').val())));
                                    backupData.push('descriptionSlot=' + encodeURI($.trim($('#backupDescription').val())));
                                    backupData.push('time=' + encodeURI($.trim($('#TB_ajaxContent .select-schedule input[name^=data]').val())));
                                    backupData.push('date=' + $('#TB_ajaxContent .input-scheduling').val());
                                    backupData.push('frequency=' + $('#TB_ajaxContent .select-recurrence input[name^=data]').val());
                                    backupData.push('frequencyText=' + encodeURI($.trim($('#TB_ajaxContent .open-recurrence .actual').text())));
                                    backupData.push('start=' + dateToSchedule[2]+dateToSchedule[1]+dateToSchedule[0]);
                                    box.ajaxJson('/virtual-machines/servers/edit/backup/configure-scheduling.json',
                                        backupData.join('&'),
                                        {
                                            method: 'POST',
                                            fnSuccess: box.createBackupSuccess,
                                            fnError: box.genericCallbackError
                                        });
                                }
                            });
                        } else {
                            $('.backup-create').removeClass('disabled');
                        }

                        // fechar lightbox
                        $('a.close').add('a#TB_closeWindowButton').add('#TB_overlay').unbind().click(function() {
                            tb_remove();
                            $('.backup-create').removeClass('disabled');
                            // $('.form-create-backup').addClass('hide');
                            box.heightModal();
                        });
                    }

                    // error
                    box.errorHandler('#msg-create-backup-error', getError, genericError, sessionStatus, false);
                },
                fnError: box.genericCallbackError
            });


        });
    };

    /**
    * Desativa elementos da interface e fecha o lightbox
    *
    * @method backupWaiting
    * @param {undefined} este método não recebe qualquer parâmetro
    * @return {undefined} este método não traz qualquer retorno
    */
    box.backupWaiting = function() {
        box.disableAllElements(box.MANAGE_SERVER_ELEMENTS);
    };

    /**
    * Exibe a mensagem final de efetuando backup
    *
    * @method createBackupSuccess
    * @param {object} j retorna o objeto json para manipulação
    * @return {undefined} este método não traz qualquer retorno
    */
    box.createBackupSuccess = function(j) {
        var getSuccess    = j.create || false,
            getError      = j.error || false,
            genericError  = j.genericResponse || false,
            sessionStatus = j.sessionStatus || false,
            dateError     = j.dateError || false,
            schedule      = getSuccess.start || false,
            dateFormatted = getSuccess.dateFormatted || false,
            frequencyText = getSuccess.frequencyText || false,
            time          = getSuccess.time || false;

        // success
        if(getSuccess && getSuccess.success === "true") {
            box.hideAllMessages();

            // criou bkp imediato
            if (!schedule) {
                $('#msg-create-backup-queue').removeClass('hide');

                $('.backup').not('.hide').addClass('hide');
                $('.backup.processing').removeClass('hide');
                $('.last-backup').removeClass('hide');
                $('.status dt:first').addClass('reload');
                $('.form-immediate').addClass('hide');
                box.updatePageElements();
            // criou bkp agendado
            } else {
                // Atualiza dados de mensagem sucesso/box Backups
                $('.date-schedule').add('.next-date').text(decodeURIComponent(dateFormatted));
                $('.hour-schedule').add('.next-hour').text(decodeURIComponent(time));
                $('.recurrence-schedule em').add('.next-frequency').text(box.urldecode(frequencyText));
                $('.backupName').html(box.validateName($('#backupName').val()));
                $('.current .desc cite').html($('#backupDescription').val());
                // controla dados para exibição
                $('.recurrence-schedule').removeClass('hide');
                $('#msg-scheduled-backup').removeClass('hide');
                $('.creating').addClass('hide');
                $('.backup.processing').addClass('hide');
                $('.backup-schedule').addClass('hide');
                $('.auto-scheduled').removeClass('hide');
                $('.backup.current').removeClass('hide');
                $('.schedule-component').slideUp();
                // links bkp agendado
                $('.li-schedule').addClass('hide');
                $('.li-change').removeClass('hide');
                $('.li-cancel').removeClass('hide');
                // links bkp imediato
                $('.last-backup').addClass('hide');
                $('.li-update').addClass('hide');
                $('.li-restore').addClass('hide');
                $('.li-delete').addClass('hide');
                $('.li-create').removeClass('hide');
                // atualiza link para possível mensagem de erro
                $('.action-try').attr('id', 'change-scheduling');
                $('.action-try').addClass('btn-schedule');
                $('.action-try').removeClass('backup-create');

                // exibe recorrência se ela existir
                if (box.urldecode($.trim(frequencyText)) !== $.trim("Sem recorrência")) {
                    $('.recurrence-schedule').removeClass('hide');
                } else {
                    $('.recurrence-schedule').addClass('hide');
                }
                // iguala height dos elementos
                box.copyHeight('.backup', '.load-balancing');
            }
        }
        box.parentIframeAdjust($('#container')[0].offsetHeight);

        if (dateError) {
            box.hideAllMessages();
            $('#msg-scheduling-date-error').removeClass('hide');
            $('.backup-create').removeClass('disabled');
        }

        // error
        if (genericError.type === "immediate" || getError.type === "immediate") {
            box.errorHandler('#msg-create-backup-error', getError, genericError, sessionStatus, false);
        } else {
            box.errorHandler('#msg-scheduling-backup-error', getError, genericError, sessionStatus, false);
        }
        box.resetModalsBackup();
    };

    /**
    * Abre modal e executa backup imediato
    *
    * @method backupImmediate
    * @param {string} button é o que dispara ação para abrir o modal
    * @return {undefined} este método não traz qualquer retorno
    */
    box.backupImmediate = function (button) {
        $(button).click(function (e) {
            e.preventDefault();
            if ($(this).hasClass('disabled')) {return false;}

            var idtServer = $(this).attr('rel').match(/-?\d/gi);
            var idtSlot = $(this).attr('rev').match(/\d/gi);

            tb_show('Fazer backup', '#TB_inline?height=450&width=639&inlineId=create-backup&modal=false', null);
            box.resetModalsBackup();
            box.heightModal();
            $('.form-create-backup').addClass('hide');
            $('.schedule-component').hide();
            $('.form-immediate').removeClass('hide');
            box.centralizeButtons('#TB_ajaxContent .actions:visible', '#TB_ajaxContent', '.actions:visible a.create', '.actions:visible a.close');
            box.centralizeButtons('#TB_ajaxContent .actions:visible', '#TB_ajaxContent', '.actions:visible a.create-immediate', '.actions:visible a.close');

            $('.create-immediate').click(function () {
                var backupName = $('.current .desc .backupName').text(),
                    backupDesc = $('.desc p cite').text(),
                    backupData = [];

                backupData.push('idtServer=' + idtServer.join(''));
                backupData.push('idtSlot=' + idtSlot.join(''));
                backupData.push('nameSlot=' + encodeURI(box.validateName($.trim(backupName))));
                backupData.push('descriptionSlot=' + encodeURI($.trim(backupDesc)));
                box.ajaxJson('/virtual-machines/servers/edit/backup/create.json',
                    backupData.join('&'),
                    {
                        method: 'POST',
                        fnBeforeSend: box.backupWaiting,
                        fnSuccess: box.createBackupSuccess,
                        fnError: box.genericCallbackError
                    }
                );
            });
        });
    };

    /**
    * Alteração/Criação de agendamento de backup
    *
    * @method generalScheduling
    * @param {string} button é o que dispara a ação da função
    * @return {undefined} este método não traz qualquer retorno
    */
    box.generalScheduling = function (button) {
        $(button).live('click', function (e) {
            e.preventDefault();
            if ($(this).hasClass('disabled')) {return false;}
            var backupData = [],
                idtServer  = $(this).attr('rel').match(/-?\d/gi),
                idtSlot    = $(this).attr('rev').match(/\d/gi);

            if ($(this).hasClass('disabled')) {return false;}

            if ($.trim($(this).attr('id')) === 'scheduling-now' || $.trim($(this).attr('id')) === 'create-scheduling') {
                tb_show('Criar agendamento', '#TB_inline?height=165&width=540&inlineId=change-schedule&modal=false', null);
                box.resetModalsBackup();
                $('#TB_ajaxContent .schedule-component').show();
                $('.general-scheduling').text('Criar');
            } else if ($.trim($(this).attr('id')) === 'change-scheduling') {
                backupData.push('idtServer='+idtServer.join(''));
                box.ajaxJson('/virtual-machines/servers/edit/get.json',
                    backupData.join('&'),
                    {
                        method: 'POST',
                        // fnBeforeSend: box.backupWaiting,
                        fnSuccess: function(j) {
                            var getSuccess = j.get || false;
                            var getError = j.error || false;
                            var genericError = j.genericResponse || false;
                            var sessionStatus = j.sessionStatus || false;

                            tb_show('Alterar agendamento', '#TB_inline?height=165&width=540&inlineId=change-schedule&modal=false',
                                null);
                            $('.general-scheduling').text('Alterar');
                            $('#TB_ajaxContent .schedule-component').show();
                            $('#TB_ajaxContent .input-scheduling').val(getSuccess.backupData.nextDate);
                            $('#TB_ajaxContent .open-schedule .actual').text(getSuccess.backupData.nextHour);
                            $('#TB_ajaxContent .open-schedule input[name=data-select]').val(getSuccess.backupData.nextHour);
                            $('#TB_ajaxContent .open-recurrence .actual').text(getSuccess.backupData.frequencyLabel);
                            $('.cloud-skin input[name^=scheduled]').val(getSuccess.backupData.isAutoScheduled);
                            // correção para o select persolanalizado
                            $('.select-personalizado ul').slideUp();
                            // error
                            box.errorHandler('#msg-scheduling-backup-error', getError, genericError, sessionStatus, false);
                        },
                        fnError: box.genericCallbackError
                    }
                );
            }

            box.selectPersonalizados('#TB_ajaxContent .open-schedule');
            box.selectPersonalizados('#TB_ajaxContent .open-recurrence');
            box.createCalendar('.input-scheduling');
            box.centralizeButtons('#TB_ajaxContent .actions:visible', '#TB_ajaxContent', '.actions:visible a.general-scheduling',
                '.actions:visible a.close');

            $('.general-scheduling').unbind().click(function () {
                var backupName = $('.desc strong:first').text(),
                    backupDesc = $('.desc p cite').text(),
                    backupStart = $('#TB_ajaxContent .input-scheduling').val().split('/'),
                    backupTime = $('#TB_ajaxContent .open-schedule input[name^=data]').val(),
                    backupFrequency = $('#TB_ajaxContent .open-recurrence input[name^=data]').val(),
                    backupFrequencyText = $('#TB_ajaxContent .open-recurrence .actual').text();

                if ($(this).hasClass('disabled')) {return false;}

                // chama função para validar campos vazios
                if (box.validateCreateBackup($(this).attr('rel')) === "schedule") {
                    backupData.push('idtBkp=' + idtSlot.join(''));
                    backupData.push('nameSlot=' + encodeURI($.trim(backupName)));
                    backupData.push('descriptionSlot=' + encodeURI($.trim(backupDesc)));
                    backupData.push('time=' + encodeURI($.trim(backupTime)));
                    backupData.push('date=' + $('#TB_ajaxContent .input-scheduling').val());
                    backupData.push('frequency=' + backupFrequency);
                    backupData.push('frequencyText=' + encodeURI($.trim(backupFrequencyText)));
                    backupData.push('start=' + backupStart[2] + backupStart[1] + backupStart[0]);

                    box.ajaxJson('/virtual-machines/servers/edit/backup/configure-scheduling.json',
                        backupData.join('&'),
                        {
                            method: 'POST',
                            fnSuccess: box.generalSchedulingSuccess,
                            fnError: box.genericCallbackError
                        }
                    );
                }
            });
        });
    };

    /**
    * Exibe informações de sucesso na interface
    *
    * @method generalSchedulingSuccess
    * @param {object} j é o objeto JSON para manipulação
    * @return {undefined} este método não traz qualquer retorno
    */
    box.generalSchedulingSuccess = function (j) {
        var getSuccess    = j.create || false,
            getError      = j.error || false,
            genericError  = j.genericResponse || false,
            sessionStatus = j.sessionStatus || false,
            dateError     = j.dateError || false,
            dateFormatted = getSuccess.dateFormatted || false,
            frequencyText = getSuccess.frequencyText || false,
            time          = getSuccess.time || false,
            isScheduled = $('#TB_ajaxContent input[name^=scheduled]').val();

        // success
        if(getSuccess && getSuccess.success === "true") {
            box.hideAllMessages();
            // Atualiza dados de mensagem sucesso
            $('.date-schedule').add('.next-date').text(decodeURIComponent(dateFormatted));
            $('.hour-schedule').add('.next-hour').text(decodeURIComponent(time));
            $('.recurrence-schedule em').add('.next-frequency').text(box.urldecode($.trim(frequencyText)));
            // Esconde Box de criação/processando backup
            $('.creating').addClass('hide');
            $('.backup.processing').addClass('hide');
            // Exibe dados de agendamento/imediato no box backups
            $('.backup-schedule').addClass('hide');
            $('.auto-scheduled').removeClass('hide');
            // Exibe box backup
            $('.backup.current').removeClass('hide');

            // trata mensagem de sucesso reagendamento/agendamento
            if (isScheduled === "true") {
                $('#msg-rescheduled-backup').removeClass('hide');
                $('.action-try').attr('id', 'change-scheduling');
            } else {
                $('#msg-scheduled-backup').removeClass('hide');
                $('.action-try').attr('id', 'scheduling-now');
            }

            // controla exibição dos links de agendamento
            $('.li-schedule').addClass('hide');
            $('.li-change').removeClass('hide');
            $('.li-change .btn-schedule').removeClass('disabled');
            $('.li-cancel').removeClass('hide');

            // exibe recorrência se ela existir
            if (box.urldecode($.trim(frequencyText)) !== $.trim("Sem recorrência")) {
                $('.recurrence-schedule').removeClass('hide');
            } else {
                $('.recurrence-schedule').addClass('hide');
            }
        }

        if (dateError) {
            box.hideAllMessages();
            $('#msg-scheduling-date-error').removeClass('hide');
            $('.action-try').removeClass('disabled');
        }

        box.copyHeight('.backup', '.load-balancing');
        box.resetModalsBackup();
        // error
        box.errorHandler('#msg-scheduling-backup-error', getError, genericError, sessionStatus, false);
    };

    /**
    * Exibe mensagem de de cancelamento do agendamento de backup
    *
    * @method cancelScheduling
    * @param {object} j retorna o objeto json para manipulação
    * @return {undefined} este método não traz qualquer retorno
    */
    box.cancelScheduling = function(button) {
        $(button).on('click', function (e) {
            e.preventDefault();
            if ($(this).hasClass('disabled')) {return false;}
            tb_show('Cancelar agendamento', '#TB_inline?height=215&width=415&inlineId=backup-cancel-scheduling&modal=false', null);
            box.centralizeButtons('#TB_ajaxContent .actions:visible', '#TB_ajaxContent', '.actions:visible a.cancel-scheduling','.actions:visible a.close');
        });
        $('a.cancel-scheduling').on('click', function (e) {
            e.preventDefault();
            var backupData = [];
                backupData.push('idtbackup=' + $(this).attr('rev'));

            box.ajaxJson('/virtual-machines/servers/edit/backup/cancel-scheduling.json', backupData.join('&'), {
                method: 'POST',
                fnSuccess: function(j) {
                    var getSuccess    = j.clearAutoScheduling || false;
                    var getError      = j.error || false;
                    var genericError  = j.genericResponse || false;
                    var sessionStatus = j.sessionStatus || false;
                    var isFree = $('.cloud-skin input[name^=free]').val(); // flag de exclusão de bkp, true se ele tem bkp

                    if (getSuccess.success) {
                        box.hideAllMessages();
                        $('#msg-cancel-scheduling').removeClass('hide');

                        // caso usuário não tenha backup
                        if (isFree === "true") {
                            $('.backup.current').removeClass('hide');
                            $('.backup-schedule').removeClass('hide');
                            $('.creating').addClass('hide');
                            $('.backup.processing').addClass('hide');
                            $('.auto-scheduled').addClass('hide');
                        // caso usuário tenha backup
                        } else {
                            $('.creating').removeClass('hide');
                            $('.backup-create').removeClass('disabled');
                            $('.backup-schedule').addClass('hide');
                            $('.backup.current').addClass('hide');
                            $('.backup.processing').addClass('hide');
                            $('.auto-scheduled').addClass('hide');
                        }

                        // atualiza link para possível mensagem de erro
                        $('.action-try').attr('id', 'scheduling-now');
                        // controle exibição de links de agendamento
                        $('.li-cancel').addClass('hide');
                        $('.li-change').addClass('hide');
                        $('.li-schedule').removeClass('hide');
                    }
                    // error
                    box.errorHandler('#msg-cancel-scheduling-error', getError, genericError, sessionStatus, false);
                },
                fnError: box.genericCallbackError
            });
            // iguala height dos elementos
            box.copyHeight('.backup', '.load-balancing');
        });
    };

    /**
    * Abre modal de atualização de nome e descrição do backup
    *
    * @method showBackupInfo
    * @param {string} btn dispara ação de abertura do modal
    * @return {undefined} este método não traz qualquer retorno
    */
    box.showBackupInfo = function (btn) {
        $(btn).unbind().click(function (e) {
            e.preventDefault();
            var backupData = [],
                idtServer  = $(this).attr('rel');

            if ($(this).hasClass('disabled')) {return false;}

            backupData.push('idtServer=' + idtServer);
            box.ajaxJson('/virtual-machines/servers/edit/get.json', backupData.join('&'), {
                method: 'POST',
                fnSuccess: function(j) {
                    var getSuccess        = j.get || false,
                        getError          = j.error || false,
                        genericError      = j.genericResponse || false,
                        sessionStatus     = j.sessionStatus || false,
                        backupData        = getSuccess.backupData || false;

                    if (getSuccess && backupData) {
                        tb_show('Editar dados', '#TB_inline?height=210&width=390&inlineId=update-info&modal=false', null);
                        box.centralizeButtons('#TB_ajaxContent .actions', '#TB_ajaxContent', '.actions:visible .edit',
                            '.actions:visible .close');

                        // popula dados atuais nos inputs
                        $('#TB_ajaxContent #editName').val(box.htmlDecode(backupData.name));
                        $('#TB_ajaxContent #editDescription').val(box.htmlDecode(box.urldecode($.trim(backupData.description))));

                        // validação de formulário
                        box.genericFormValidator('.form-update-info input', '.form-update-info textarea');
                        $('.form-update-info').submit(function (e) {
                            e.preventDefault();
                        });
                    }

                    // error
                    box.errorHandler('#msg-update-error', getError, genericError, sessionStatus, false);
                },
                fnError: box.genericCallbackError
            });
        });

        // fechar lightbox
        $('a.close').add('a#TB_closeWindowButton').add('#TB_overlay').unbind().click(function() {
            tb_remove();
            box.heightModal();
            $('.btn.edit').removeClass('disabled');
        });
    };

    /**
    * Atualiza nome e descrição do backup
    *
    * @method updateBackupInfo
    * @param {string} btn dispara ação para edição
    * @return {undefined} este método não traz qualquer retorno
    */
    box.updateBackupInfo = function (btn) {
        box.sendFormByReturn($('#editName'), $(btn));
        $(btn).unbind().click(function (e) {
            e.preventDefault();
            var backupData = [],
                idtBackup  = $(this).attr('rel'),
                backupName = $('#TB_ajaxContent #editName').val(),
                backupDesc = $('#TB_ajaxContent #editDescription').val();

            if ($(this).hasClass('disabled')) {return false;}

            backupData.push('idtBackup=' + idtBackup);
            backupData.push('name=' + encodeURI(box.validateName(backupName)));
            backupData.push('description=' + encodeURI($.trim(backupDesc)));
            box.ajaxJson(
                '/virtual-machines/servers/edit/backup/update-info.json',
                backupData.join('&'),
                {
                    method: 'POST',
                    fnSuccess: function (j) {
                        var getSuccess    = j.update || false,
                            getError      = j.error || false,
                            genericError  = j.genericResponse || false,
                            sessionStatus = j.sessionStatus || false;

                        if (getSuccess) {
                            box.hideAllMessages();
                            // atualiza dados na tela
                            $('.backupName').text(box.urldecode(box.validateName(backupName)));
                            $('.current .desc. p > cite').text(box.urldecode(backupDesc));
                            // mensagem sucesso
                            $('#msg-update-info').removeClass('hide');
                            box.parentIframeAdjust($('#container')[0].offsetHeight);
                        }

                        // error
                        box.errorHandler('#msg-update-error', getError, genericError, sessionStatus, false);
                    },
                    fnError: box.genericCallbackError
                }
            );
        });
    };

    /**
    * Envia o usuário para o fluxo de atualização do backup corrente
    *
    * @method updateBackup
    * @param {string} button identifica o(s) botao(oe) que invocará os eventos para criar o backup
    * @return {undefined} este método não traz qualquer retorno
    */
    box.updateBackup = function(button) {
        $(button).unbind().click(function(e) {
            e.preventDefault();
            if ($(this).hasClass('disabled')) {return false;}
            $(this).attr('href','#').addClass("disabled");
            var idtServer = $(this).attr('rel').match(/-?\d/gi);
            var idtSlot = $(this).attr('rev').match(/\d/gi);

            var backupData = [];
            backupData.push('idtServer='+idtServer.join(''));
            box.ajaxJson('/virtual-machines/servers/edit/get.json', backupData.join('&'), {
                method: 'POST',
                fnSuccess: function(j) {
                    var getSuccess = j.get || false;
                    var getError = j.error || false;
                    var genericError = j.genericResponse || false;
                    var sessionStatus = j.sessionStatus || false;

                    // success
                    if(getSuccess) {
                        $('.update-backup input').add('.update-backup textarea').val('');
                        box.limitTextarea('.update-backup textarea[maxlength]');

                        if(idtServer && idtSlot) {
                            tb_show('Refazer backup','#TB_inline?height=165&width=405&inlineId=update-backup&modal=false',null);
                            box.centralizeButtons('#TB_ajaxContent .actions:visible', '#TB_ajaxContent',
                                '.actions:visible a.update', '.actions:visible a.close');
                            box.heightModal();
                            $('#TB_ajaxContent .serverName').html($('span.servername:first').text());

                            var escope = '#backup-'+idtSlot.join('')+' ',
                                backupName = $('dd.desc .backupName').text(),
                                backupdesc = $('dd.desc p cite:first').text();
                            // preenche os campos escondidos na hora de refazer o backup

                            $('#backupUpdateName').val(backupName);
                            $('#backupUpdateDescription').val(backupdesc);

                            $('.update-backup .backupName').html($(escope+'dd.item').html());
                            $('.update-backup .backupDate').html($(escope+'dd.createat span').html());
                            $('#backupUpdateName').focus();

                            $('a.update').unbind().click(function() {
                                var backupData = [];
                                backupData.push('idtServer='+idtServer.join(''));
                                backupData.push('idtSlot='+idtSlot.join(''));
                                backupData.push('nameSlot='+encodeURI($.trim($('#backupUpdateName').val())));
                                backupData.push('descriptionSlot='+encodeURI($.trim($('#backupUpdateDescription').val())));
                                box.ajaxJson('/virtual-machines/servers/edit/backup/update.json',
                                    backupData.join('&'),
                                    {
                                        method: 'POST',
                                        fnBeforeSend: box.backupWaiting,
                                        fnSuccess: box.updateBackupSuccess,
                                        fnError: box.genericCallbackError
                                    }
                                );
                            });
                        } else {
                            $('.backup-update').removeClass('disabled');
                        }

                        // fechar lightbox
                        $('a.close').add('a#TB_closeWindowButton').add('#TB_overlay').unbind().click(function() {
                            tb_remove();
                            $('.backup-update').removeClass('disabled');
                            box.heightModal();
                        });
                    }

                    // error
                    box.errorHandler('#msg-update-backup-error', getError, genericError, sessionStatus, false);
                },
                fnError: box.genericCallbackError
            });
        });
    };


    /**
    * Exibe a mensagem final de atualizando backup
    *
    * @method updateBackupSuccess
    * @param {object} j retorna o objeto json para manipulação
    * @return {undefined} este método não traz qualquer retorno
    */
    box.updateBackupSuccess = function(j) {
        var getSuccess = j.update || false;
        var getError = j.error || false;
        var genericError = j.genericResponse || false;
        var sessionStatus = j.sessionStatus || false;

        // success
        if(getSuccess && getSuccess.success == "true") {
            box.hideAllMessages();
            $('#msg-update-backup-queue').removeClass('hide');

            $('.backup').not('.hide').addClass('hide');
            $('.backup.processing').removeClass('hide');

            $('.status dt:first').addClass('reload');
            box.updatePageElements();
        }

        // error
        box.errorHandler('#msg-update-backup-error', getError, genericError, sessionStatus, false);
    };

    /**
    * Envia o usuário para o fluxo de restore do backup corrente
    *
    * @method restoreBackup
    * @param {string} button identifica o(s) botao(oe) que invocará os eventos para criar o backup
    * @return {undefined} este método não traz qualquer retorno
    */
    box.restoreBackup = function(button) {
        $(button).unbind().click(function(e) {
            e.preventDefault();
            if ($(this).hasClass('disabled')) {return false;}
            $(this).attr('href','#').addClass("disabled");
            var idtServer = $(this).attr('rel').match(/-?\d/gi);
            var idtSlot = $(this).attr('rev').match(/\d/gi);
            var bOrigin = $(this).attr('class').split(" ")[0];

            var backupData = [];
            backupData.push('idtServer='+idtServer.join(''));
            box.ajaxJson('/virtual-machines/servers/edit/get.json', backupData.join('&'), {
                method: 'POST',
                fnSuccess: function(j) {
                    var getSuccess = j.get || false;
                    var getError = j.error || false;
                    var genericError = j.genericResponse || false;
                    var sessionStatus = j.sessionStatus || false;
                    // success
                    if(getSuccess.attachedDisks > 0) {
                        box.forbiddenBackup('Restaurar backup', bOrigin);
                        $('.form-create-backup').addClass('hide');
                        box.centralizeButtons('#TB_ajaxContent .actions:visible', '#TB_ajaxContent', '.actions:visible a.close');
                    } else {
                        if(idtSlot) {
                            var backupData = [];
                            backupData.push('idtSlot='+idtSlot.join(''));

                            tb_show('Restaurar backup','#TB_inline?height=185&width=435&inlineId=restore-backup&modal=false',null);
                            box.heightModal();
                            box.centralizeButtons('#TB_ajaxContent .actions:visible', '#TB_ajaxContent', '.actions:visible a.restore','.actions:visible a.close');
                            var escope = '#backup-'+idtSlot.join('')+' ';

                            // nome do servidor no modal
                            $('.serverName').html($('span.servername:first').html());

                            $('.restore-backup .backupDate').html($(escope+'dd.createat span').html());

                            $('.restore').unbind().click(function() {
                                box.ajaxJson('/virtual-machines/servers/edit/backup/restore.json',
                                    backupData.join('&'),
                                    {
                                        method: 'POST',
                                        fnBeforeSend: box.backupWaiting,
                                        fnSuccess: box.restoreBackupSuccess,
                                        fnError: box.genericCallbackError
                                    }
                                );
                            });
                        }

                        // fechar lightbox
                        $('a.close').add('a#TB_closeWindowButton').add('#TB_overlay').unbind().click(function() {
                            tb_remove();
                            $('.backup-restore').removeClass('disabled');
                            box.heightModal();
                        });
                    }

                    // error
                    box.errorHandler('#msg-restore-backup-error', getError, genericError, sessionStatus, false);
                },
                fnError: box.genericCallbackError
            });
        });
    };

    /**
    * Exibe a mensagem final de restaurando backup
    *
    * @method restoreBackupSuccess
    * @param {object} j retorna o objeto json para manipulação
    * @return {undefined} este método não traz qualquer retorno
    */
    box.restoreBackupSuccess = function(j) {
        var getSuccess = j.restore || false;
        var getError = j.error || false;
        var genericError = j.genericResponse || false;
        var sessionStatus = j.sessionStatus || false;

        // success
        if(getSuccess && getSuccess.success == "true") {
            box.hideAllMessages();
            $('#msg-restore-backup-wait').removeClass('hide');
            $('#msg-restore-backup-wait .backupName').html($('.current .desc .backupName').text());

            $('.backup').not('.hide').addClass('hide');
            $('.backup.processing').removeClass('hide');

            $('.status dt:first').addClass('reload');
            box.updatePageElements();
        }

        // error
        box.errorHandler('#msg-restore-backup-error', getError, genericError, sessionStatus, false);
    };

    /**
    * Envia o usuário para o fluxo de exclusão de backup
    *
    * @method deleteBackup
    * @param {string} button identifica o(s) botao(oe) que invocará os eventos para criar o backup
    * @return {undefined} este método não traz qualquer retorno
    */
    box.deleteBackup = function(button) {
        $(button).unbind().click(function(e) {
            e.preventDefault();
            if ($(this).hasClass('disabled')) {return false;}
            $(this).attr('href','#').addClass("disabled");

            var idtSlot = $(this).attr('rel').match(/\d/gi);
            if(idtSlot) {
                var backupData = [];
                backupData.push('idtSlot='+idtSlot.join(''));

                var escope = '#backup-'+idtSlot.join('')+' ';
                tb_show('Excluir backup','#TB_inline?height=185&width=400&inlineId=delete-backup&modal=false',null);
                box.centralizeButtons('#TB_ajaxContent .actions:visible', '#TB_ajaxContent', '.actions:visible a.delete','.actions:visible a.close');
                $('strong.serverName').html($('span.servername:first').html());
                $('strong.backupName').html($('.backup.current strong:first').text());
                $('strong.backupDate').html($(escope+'dd.current span').html());

                $('a.delete').unbind().click(function() {
                    box.ajaxJson('/virtual-machines/servers/edit/backup/delete.json',
                        backupData.join('&'),
                        {
                            method: 'POST',
                            fnBeforeSend: box.backupWaiting,
                            fnSuccess: box.deleteBackupSuccess,
                            fnError: box.genericCallbackError
                        }
                    );
                });
                box.heightModal();
            }


            // fechar lightbox
            $('a.close').add('a#TB_closeWindowButton').add('#TB_overlay').unbind().click(function() {
                tb_remove();
                $('.backup-delete').removeClass('disabled');
                box.heightModal();
            });
        });

    };


    /**
    * Atualiza a interface após a exclusão do backup
    *
    * @method instanceLabelsSuccess
    * @param {object} j retorna o objeto json para manipulação
    * @return {undefined} este método não traz qualquer retorno
    */
    box.deleteBackupSuccess = function(j) {
        var getSuccess = j.free || false;
        var getError = j.error || false;
        var genericError = j.genericResponse || false;
        var sessionStatus = j.sessionStatus || false;

        // success
        if(getSuccess && getSuccess.success == "true") {
            box.hideAllMessages();

            $('#msg-delete-backup-wait .backupName').html($('.backup.current .desc .backupName').text());
            $('#msg-delete-backup-wait').removeClass('hide');

            $('.backup').not('.hide').addClass('hide');
            $('.backup.processing').removeClass('hide');

            $('.status dt:first').addClass('reload');
            box.updatePageElements();
        }

        // error
        box.errorHandler('#msg-delete-backup-error', getError, genericError, sessionStatus, false);
    };


    /**
    * Exibe mensagem para o usuário indicando a impossiblidade de executar as ações
    *
    * @method forbiddenBackup
    * @param {string} title titulo do lightbox
    * @param {string} origin a classe da ação selecionada
    * @return {undefined} este método não traz qualquer retorno
    */
    box.forbiddenBackup = function(title, origin) {
        tb_show(title, '#TB_inline?height=210&width=560&inlineId=create-backup&modal=false', null);

        if(origin == 'backup-restore') {
            $('.detach-backup-restore').removeClass('hide');
        }

        box.heightModal();

        // fechar lightbox
        $('a.close').add('a#TB_closeWindowButton').add('#TB_overlay').unbind().click(function() {
            tb_remove();
            box.heightModal();
            $('.'+origin).removeClass('disabled');
            $('.detach-backup-restore').addClass('hide');
        });
    };


    /**
    * Envia o usuário para o fluxo de cancelamento do backup corrente
    *
    * @method abortBackup
    * @param {string} button identifica o(s) botao(oe) que invocará os eventos para criar o backup
    * @return {undefined} este método não traz qualquer retorno
    */
    box.abortBackup = function(button1,button2) {
        $(button1).add(button2).unbind().click(function(e) {
            e.preventDefault();
            if ($(this).hasClass('disabled')) {return false;}
            $(this).attr('href','#').addClass("disabled");
            $('.status dd:first').removeClass('reload');
            box.FLOW_ACTION = parseInt($(this).attr('rev'), 10);

            var idtSlot = $(this).attr('rel').match(/\d/gi);
            if(idtSlot) {
                var backupData = [];
                backupData.push('idtSlot='+idtSlot.join(''));
                box.ajaxJson('/virtual-machines/servers/edit/backup/abort.json', backupData.join('&'), { method: 'POST', fnBeforeSend: box.abortBackupWaiting, fnSuccess: box.abortBackupSuccess, fnError: box.genericCallbackError });
            }
        });
    };


    /**
    * Desativa elementos da interface e exibe mensagem processando
    *
    * @method abortBackupWaiting
    * @param {undefined} este método não recebe qualquer parâmetro
    * @return {undefined} este método não traz qualquer retorno
    */
    box.abortBackupWaiting = function() {
        clearInterval(box.CONTROL_INTERVAL);
        box.CONTROL_INTERVAL = null;
    };


    /**
    * Atualiza a interface após o cancelamento do backup corrente
    *
    * @method abortBackupSuccess
    * @param {object} j retorna o objeto json para manipulação
    * @return {undefined} este método não traz qualquer retorno
    */
    box.abortBackupSuccess = function(j) {
        var getSuccess = j.abort || false;
        var getError = j.error || false;
        var genericError = j.genericResponse || false;
        var sessionStatus = j.sessionStatus || false;


        // success
        if(getSuccess && getSuccess.success == "true") {
            box.hideAllMessages();

            if (box.FLOW_ACTION === 0) {
                $('#msg-abort-backup-wait').removeClass('hide');
                $('.status dd:first').html('Cancelando backup');
            } else {
                $('#msg-abort-backup-update-wait').removeClass('hide');
                $('.status dd:first').html('Cancelando');
            }

            var escope = '#backup-'+getSuccess.controlRequest+' ';
            $(escope+'dd.item').html('Cancelando');
            setTimeout(function() {
                if(box.FLOW_ACTION === 0) {
                    $(escope+'dd.item').html('Nenhum').addClass('not-item').removeClass('item');
                    $(escope+'dd:last').after('<dd class="button"><a href="#" class="btn backup-create disabled" rel="'+$('#restart-server').attr('rel')+'" rev="'+getSuccess.controlRequest+'">Fazer backup</a></dd>');
                    box.createBackup('.backup-create');
                } else {
                    setTimeout(function() {
                        $(escope+'dd.item').html($(escope+'dd.item').attr('rev'));
                        $(escope+'dd.detail').removeClass('hide');
                        // $('.backup-options').removeClass('hide');
                        // $('.backup-options a').attr('href','#').removeClass('disabled');
                    }, 1000);
                }

                // atualiza interface
                setTimeout(function() {
                    var codeServer = ['idtServer='+$('#fieldvalue').val()];
                    box.ajaxJson('/virtual-machines/servers/edit/get.json', codeServer.join('&'), {
                        method: 'POST',
                        fnSuccess: function(j) {
                            var getSuccess = j.get || false;
                            var getError = j.error || false;
                            var genericError = j.genericResponse || false;
                            var sessionStatus = j.sessionStatus || false;

                            // success
                            if(getSuccess) {
                                box.hideAllMessages();
                                if(box.FLOW_ACTION === 0) { $('#msg-abort-backup-ok').removeClass('hide'); } else { $('#msg-abort-backup-update-ok').removeClass('hide'); }
                                box.enableAllElements(box.MANAGE_SERVER_ELEMENTS,[], box.MANAGE_SERVER_FLAGS, getSuccess);
                                $('dl.status dd:first').html(getSuccess.statusDescription);
                                // caso não tenha bkp imediato e não tenha agendado
                                if(getSuccess.backupData.statusLabel === "UNUSED" &&
                                    getSuccess.backupData.isAutoScheduled === "false") {
                                    $('.backup.creating').removeClass('hide');
                                    $('.backup.processing').addClass('hide');
                                    $('.backup.current').addClass('hide');
                                // caso tenha apenas bkp imediato
                                } else if (getSuccess.backupData.statusLabel !== "UNUSED" &&
                                    getSuccess.backupData.isAutoScheduled === "false") {
                                    // informacoes bkp
                                    $('.backup.current').removeClass('hide');
                                    $('.last-backup').removeClass('hide');
                                    $('.backup-schedule').removeClass('hide');
                                    $('.backup.creating').addClass('hide');
                                    $('.backup.processing').addClass('hide');
                                    $('.auto-scheduled').addClass('hide');
                                    // links combo
                                    $('.li-create').addClass('hide');
                                    $('.li-change').addClass('hide');
                                    $('.li-cancel').addClass('hide');
                                    $('.li-update').removeClass('hide');
                                    $('.li-restore').removeClass('hide');
                                    $('.li-delete').removeClass('hide');
                                    $('.li-schedule').removeClass('hide');
                                // caso tenha bkp imediato e tenha agendado
                                } else if (getSuccess.backupData.statusLabel !== "UNUSED" &&
                                    getSuccess.backupData.isAutoScheduled === "true") {
                                    $('.backup.current').removeClass('hide');
                                    $('.last-backup').removeClass('hide');
                                    $('.auto-scheduled').removeClass('hide');
                                    $('.backup.creating').addClass('hide');
                                    $('.backup.processing').addClass('hide');
                                    $('.backup-schedule').addClass('hide');
                                    // links combo
                                    $('.li-create').addClass('hide');
                                    $('.li-schedule').addClass('hide');
                                    $('.li-update').removeClass('hide');
                                    $('.li-restore').removeClass('hide');
                                    $('.li-delete').removeClass('hide');
                                    $('.li-change').removeClass('hide');
                                    $('.li-cancel').removeClass('hide');
                                // caso tenha apenas bkp agendado
                                } else {
                                    $('.last-backup').addClass('hide');
                                    $('.backup.creating').addClass('hide');
                                    $('.backup.processing').addClass('hide');
                                    $('.backup-schedule').addClass('hide');
                                    $('.backup.current').removeClass('hide');
                                    $('.auto-scheduled').removeClass('hide');
                                    // links combo
                                    $('.li-schedule').addClass('hide');
                                    $('.li-update').addClass('hide');
                                    $('.li-restore').addClass('hide');
                                    $('.li-delete').addClass('hide');
                                    $('.li-create').removeClass('hide');
                                    $('.li-change').removeClass('hide');
                                    $('.li-cancel').removeClass('hide');
                                }

                                if(getSuccess.statusLabel == "STOPPED") {
                                    $('#disconnect-server').addClass('hide');
                                    $('#connect-server').removeClass('hide');
                                }

                                $('a.abort-update').add('a.abort-backup').removeClass('disabled');
                            }

                            // error
                            box.errorHandler('#msg-abort-backup-error', getError, genericError, sessionStatus, box.CONTROL_INTERVAL);
                        },
                        fnError: box.genericCallbackError
                    });
                }, 1000);
            }, box.TIME_LATENCY);
        }

        // error
        box.errorHandler('#msg-abort-backup-error', getError, genericError, sessionStatus, false);
    };


    /**
    * Exibe modal com dicas de backup
    *
    * @method backupTips
    * @param {string} button dispara ação para abertura de modal
    * @return {undefined} este método não traz qualquer retorno
    */
    box.backupTips = function (button) {
        $(button).click(function () {
            tb_show('Protegendo seus dados', '#TB_inline?height=210&width=488&inlineId=backup-tips&modal=false', null);
            box.centralizeButtons('#TB_ajaxContent .actions', '#TB_ajaxContent', '.actions:visible .close');
        });
    };

    /**
    * Realiza a confirmação do procedimento efetuado pelos fluxos de backup
    *
    * @method acknowledgeBackup
    * @param {undefined} este método não recebe qualquer parâmetro
    * @return {undefined} este método não traz qualquer retorno
    */
    box.acknowledgeBackup = function(idtBackup, typeAction) {
        var backupData = [];

        backupData.push('idtSlot=' + idtBackup);
        backupData.push('typeAction=' + typeAction);
        box.ajaxJson('/virtual-machines/servers/edit/backup/ack.json', backupData.join('&'), {
            method: 'POST',
            fnSuccess: function(j) {
                var getSuccess = j.ack || false;
                var getError = j.error || false;
                var genericError = j.genericResponse || false;
                var sessionStatus = j.sessionStatus || false;

                // success
                if(getSuccess.success == "true") {
                    setTimeout(function() {
                        var codeServer = [];
                        codeServer.push('idtServer='+$('#fieldvalue').val());
                        box.ajaxJson('/virtual-machines/servers/edit/get.json', codeServer.join('&'), {
                            method: 'POST',
                            fnSuccess: function(j) {
                                var getSuccess = j.get || false;
                                var getError = j.error || false;
                                var genericError = j.genericResponse || false;
                                var sessionStatus = j.sessionStatus || false;

                                // success
                                if(getSuccess) {
                                    box.enableAllElements(box.MANAGE_SERVER_ELEMENTS,[], box.MANAGE_SERVER_FLAGS, getSuccess);
                                    $('dl.status dd:first').html(getSuccess.statusDescription);
                                    box.parentIframeAdjust($('#container')[0].offsetHeight);
                                    // delete true = usuário tem backup
                                    $('.cloud-skin input[name^=free]').val(getSuccess.backupData.free);
                                    if(getSuccess.statusLabel == "STOPPED") {
                                        $('#disconnect-server').addClass('hide');
                                        $('#connect-server').removeClass('hide');
                                        // links agendamento
                                        $('#create-scheduling').removeClass('disabled');
                                        $('#change-scheduling').removeClass('disabled');
                                        $('.cancel-request').removeClass('disabled');
                                    }
                                }

                                // error
                                box.errorHandler('.exception', getError, genericError, sessionStatus, box.CONTROL_INTERVAL);
                            },
                            fnError: box.genericCallbackError
                        });
                    }, 1000);
                }

                // error
                box.errorHandler('.exception', getError, genericError, sessionStatus, box.CONTROL_INTERVAL);
            },
            fnError: box.genericCallbackError
        });

        // encerra pulling
        clearInterval(box.CONTROL_INTERVAL);
        box.CONTROL_INTERVAL = null;
    };

    /**
    * Envia o usuário para o fluxo de upgrade / downgrade
    *
    * @method upgradeOrDowngrade
    * @param {string} button identifica o(s) botao(oe) que invocará os eventos para conectar um disco
    * @return {undefined} este método não traz qualquer retorno
    */
    box.upgradeOrDowngrade = function(button) {
        $(button).unbind().click(function(e){
            e.preventDefault();
            if ($(this).hasClass('disabled')) {return false;}
            $(this).attr('href','#').addClass("disabled");

            var codeServer = [];
            codeServer.push('idtServer='+$(this).attr('rel'));
            box.ajaxJson('/virtual-machines/servers/edit/get.json', codeServer.join('&'), { method: 'POST', fnSuccess: box.upgradeOrDowngradeSuccess, fnError: box.genericCallbackError });
        });
    };


    /**
    * Verifica se a máquina esta desligada, antes de enviar o usuário para o fluxo de upgrade / downgrade
    *
    * @method instanceLabelsSuccess
    * @param {object} j retorna o objeto json para manipulação
    * @return {undefined} este método não traz qualquer retorno
    */
    box.upgradeOrDowngradeSuccess = function(j) {
        var getSuccess = j.get || false;
        var getError = j.error || false;
        var genericError = j.genericResponse || false;
        var sessionStatus = j.sessionStatus || false;

        // success
        if(getSuccess && getSuccess.statusLabel == 'STOPPED') {
            $('#manage #fieldaction').val($('.up-down-grade').data('action'));
            $('#manage #fieldvalue').val($('.up-down-grade').attr('rel'));
            $('#manage').attr('action', $('.up-down-grade').attr('rev')).submit();
            // return false;
        } else {
            tb_show('Atenção','#TB_inline?height=210&width=560&inlineId=upgrade-downgrade&modal=false',null);
            $('.upgrade-choice').removeClass('hide');
            $('a.disconnect-server').attr('rel',getSuccess.controlRequest);
            box.centralizeButtons('#TB_ajaxContent .actions', '#TB_ajaxContent', '.actions:visible .disconnect-server', '.actions:visible .close');
            box.disconnect('.disconnect-server','upgradedowngrade');
            box.heightModal();

            // fechar lightbox
            $('a.close').add('a#TB_closeWindowButton').add('#TB_overlay').unbind().click(function() {
                tb_remove();
                box.heightModal();
                $('.up-down-grade').removeClass('disabled');
            });
        }

        // error
        box.errorHandler('#msg-updown-error', getError, genericError, sessionStatus, false);
    };

    /**
    * Redireciona o usuário de acordo com os callbacks invocados pelo cadastro
    *
    * @method upgradeOrDowngradeProcess
    * @param {boolean} msg true para mensagem de sucesso e false para de erro
    * @param {string} instance identificador da instancia
    * @return {undefined} este método não traz qualquer retorno
    */
    box.upgradeOrDowngradeProcess = function(msg, instance) {
        var baseUrl = box.APP_PATH + '/virtual-machines/servers/swap-plan/feedback/?instance=' + instance;
        var error = baseUrl + '&return=error';
        var success = baseUrl + '&return=success';
        self.location = (msg === false) ?  error : success;
    };

    /**
    * Atualiza elementos da tela durante estagios intermediarios da máquina de estados
    *
    * @method updatePageElements
    * @param {undefined} este método não recebe qualquer parâmetro
    * @return {undefined} este método não traz qualquer retorno
    */
    box.updatePageElements = function() {
        if($('.reload').size() > 0) {
            var codeServer = [];
            codeServer.push('idtServer='+$('#fieldvalue').val());
            box.ajaxJson('/virtual-machines/servers/edit/get.json', codeServer.join('&'), { method: 'POST', fnSuccess: box.updatePageElementsSuccess, fnError: box.genericCallbackError });
            box.CONTROL_INTERVAL = setInterval(function(){
                box.ajaxJson('/virtual-machines/servers/edit/get.json', codeServer.join('&'), { method: 'POST', fnSuccess: box.updatePageElementsSuccess, fnError: box.genericCallbackError });
            }, box.TIME_LATENCY);
        }
    };


    /**
    * Avalia o retorno da API para atualizar os elementos na tela
    *
    * @method updatePageElementsSuccess
    * @param {object} j retorna o objeto json para manipulação
    * @return {undefined} este método não traz qualquer retorno
    */
    box.updatePageElementsSuccess = function(j) {
        var getSuccess = j.get || false;
        var getError = j.error || false;
        var genericError = j.genericResponse || false;
        var sessionStatus = j.sessionStatus || false;

        // Status
        $('dl.status dd:first').html(getSuccess.statusDescription);

        // Mensagens
        if(getSuccess) {
            box.LAST_MESSAGE = box.hideAllMessages();
            $('#rebootIp').addClass('hide');

            // reconfigurando
            if(getSuccess.statusLabel == "RECONFIGURING") {
                $('#msg-updown-info-callback').removeClass('hide');
            }

            // instalando
            if(getSuccess.statusLabel == "INSTALLING") {
                $('#msg-installing-wait').removeClass('hide');
                $('.contract-ip').addClass('disabled');
                $('.backup-delete').addClass('disabled');
                $('#create-scheduling').addClass('disabled');
                $('#change-scheduling').addClass('disabled');
                $('.cancel-request').addClass('disabled');
            }

            // desinstalando
            if(getSuccess.statusLabel == "UNINSTALLING") {
                $('#msg-uninstalling-wait').removeClass('hide');
                $('.contract-ip').addClass('disabled');
                $('.backup-delete').addClass('disabled');
                $('#create-scheduling').addClass('disabled');
                $('#change-scheduling').addClass('disabled');
                $('.cancel-request').addClass('disabled');
            }

            // reiniciando
            if(getSuccess.statusLabel == "REBOOTING") {
                $('dl.status dd').eq(0).html('Reiniciando');
                $('#msg-restart-wait').removeClass('hide');
                box.LAST_STATUS = 'REBOOTING';

                $('#create-scheduling').addClass('disabled');
                $('#change-scheduling').addClass('disabled');
                $('.cancel-request').addClass('disabled');

                //atualiza ip privado
                if (getSuccess.rebootPrivate == "true") {
                    if (!$(".reiniciar span.ligar-servidor").hasClass('hide')) {
                        box.atualizaLabelIp('Definindo', '.reiniciar span.ligar-servidor');
                    } else {
                        box.atualizaLabelIp('Definindo', '.reiniciar span.reiniciar-servidor');
                    }
                }
                // atualiza mensagem do ip público
                if (getSuccess.rebootPublicIp == "true") {
                    if (!$(".reboot span.ligar-servidor").hasClass('hide')) {
                        box.atualizaLabelIp('Definindo', '.reboot span.ligar-servidor');
                    } else {
                        box.atualizaLabelIp('Definindo', '.reboot span.reiniciar-servidor');
                    }
                }
                if (!$(".reiniciar span.ligar-servidor").hasClass('hide')) {
                    box.atualizaIpPrivado(getSuccess.privateAddresses, ".reiniciar span.ligar-servidor");
                } else {
                    box.atualizaIpPrivado(getSuccess.privateAddresses, ".reiniciar span.reiniciar-servidor");
                }
            }

            // ligando
            if(getSuccess.statusLabel == "STARTING") {
                $('.backup-delete').removeClass('disabled');
                $('#create-scheduling').addClass('disabled');
                $('#change-scheduling').addClass('disabled');
                $('.cancel-request').addClass('disabled');
                if(box.LAST_STATUS == 'REBOOTING') {
                    $('dl.status dd').eq(0).html('Reiniciando');
                    $('#msg-restart-wait').removeClass('hide');
                } else {
                    $('#msg-connect-wait').removeClass('hide');
                    box.LAST_STATUS = 'STARTING';
                }

                //atualiza ip privado
                if (getSuccess.rebootPrivate == "true") {
                    if (!$(".reiniciar span.ligar-servidor").hasClass('hide')) {
                        box.atualizaLabelIp('Definindo', '.reiniciar span.ligar-servidor');
                    } else {
                        box.atualizaLabelIp('Definindo', '.reiniciar span.reiniciar-servidor');
                    }
                }

                if (!$(".reiniciar span.ligar-servidor").hasClass('hide')) {
                    box.atualizaIpPrivado(getSuccess.privateAddresses, ".reiniciar span.ligar-servidor");
                } else {
                    box.atualizaIpPrivado(getSuccess.privateAddresses, ".reiniciar span.reiniciar-servidor");
                }
            }

            // desligando
            if(getSuccess.statusLabel == "STOPPING") {
                $('#msg-disconnect-wait').removeClass('hide');
                $('.backup-delete').removeClass('disabled');
                $('#create-scheduling').addClass('disabled');
                $('#change-scheduling').addClass('disabled');
                $('.cancel-request').addClass('disabled');
            }

            // backup criacao - fila
            if(getSuccess.statusLabel == "BACKUP_REQUESTED") {
                $('#msg-create-backup-queue').removeClass('hide');
                box.parentIframeAdjust($('#container')[0].offsetHeight);
                $('#create-scheduling').addClass('disabled');
                $('#change-scheduling').addClass('disabled');
                $('.cancel-request').addClass('disabled');
            }

            // backup criacao - em processamento
            if(getSuccess.statusLabel == "BACKING_UP") {
                $('#msg-create-backup-wait').removeClass('hide');
                box.parentIframeAdjust($('#container')[0].offsetHeight);
                $('#create-scheduling').addClass('disabled');
                $('#change-scheduling').addClass('disabled');
                $('.cancel-request').addClass('disabled');
            }

            // backup criacao - completo
            if(getSuccess.statusLabel == "BACKUP_COMPLETED") {
                $('#msg-create-backup-ok strong').html(getSuccess.backupData.name);
                $('#msg-create-backup-ok').removeClass('hide');

                $('.backup').not('.hide').addClass('hide');
                $('.backup.current').removeClass('hide');
                $('.backup.current dd.desc').find('strong.backupName').html(getSuccess.backupData.name);
                $('.backup.current dd.desc').find('p cite:first').html(box.urldecode(getSuccess.backupData.description));

                // atualiza informações de data e horário de criação do backup
                $('.created-date').html(getSuccess.backupData.date);
                $('.created-hour').html(getSuccess.backupData.hour);
                // links imediato
                $('.li-create').addClass('hide');
                $('.li-update').removeClass('hide');
                $('.li-restore').removeClass('hide');
                $('.li-delete').removeClass('hide');

                // caso tenha bkp agendado
                if (getSuccess.backupData.isAutoScheduled === "true") {
                    $('.backup-schedule').addClass('hide');
                    $('.auto-scheduled').removeClass('hide');
                    $('.li-schedule').addClass('hide');
                    $('.li-change').removeClass('hide');
                    $('.li-cancel').removeClass('hide');
                } else {
                    $('.li-schedule').removeClass('hide');
                    $('.li-change').addClass('hide');
                    $('.li-cancel').addClass('hide');
                    $('.auto-scheduled').addClass('hide');
                    $('.backup-schedule').removeClass('hide');
                }

                // atualiza link para possível mensagem de erro
                $('.action-try').attr('id', 'change-scheduling');
                $('.action-try').addClass('btn-schedule');
                $('.action-try').removeClass('backup-create');

                // links agendamento
                $('#create-scheduling').removeClass('disabled');
                $('#change-scheduling').removeClass('disabled');
                $('.cancel-request').removeClass('disabled');

                // atualiza valor sobre backup agendado
                $('.cloud-skin input[name^=scheduled]').val(getSuccess.backupData.isAutoScheduled);
                // iguala height dos elementos
                box.copyHeight('.backup', '.load-balancing');
                // confirmacao
                box.acknowledgeBackup(getSuccess.backupData.id, 'backup');
            }

            // backup criacao - erro
            if(getSuccess.statusLabel == "BACKUP_FAILED") {
                $('#msg-create-backup-error').removeClass('hide');

                $('dl.status dd:first').html(getSuccess.statusDescription);
                $('.backup').not('.hide').addClass('hide');
                $('.backup.creating').removeClass('hide');
                $('.backup.current .desc')
                    .find('strong.backupName').html(getSuccess.backupData.name)
                    .find('p cite').html(getSuccess.backupData.description);

                // caso tenha bkp agendado
                if (getSuccess.backupData.isAutoScheduled === "true") {
                    $('.backup-schedule').addClass('hide');
                    $('.auto-scheduled').removeClass('hide');
                    $('.li-schedule').addClass('hide');
                    $('.li-change').removeClass('hide');
                    $('.li-cancel').removeClass('hide');
                } else {
                    $('.li-schedule').removeClass('hide');
                    $('.li-change').addClass('hide');
                    $('.li-cancel').addClass('hide');
                    $('.auto-scheduled').addClass('hide');
                    $('.backup-schedule').removeClass('hide');
                }

                // links agendamento
                $('#create-scheduling').removeClass('disabled');
                $('#change-scheduling').removeClass('disabled');
                $('.cancel-request').removeClass('disabled');

                // atualização de data e horário
                $('.created-date').html(getSuccess.backupData.date);
                $('.created-hour').html(getSuccess.backupData.hour);
                // confirmacao
                box.acknowledgeBackup(getSuccess.backupData.id, 'backup');
            }

            // backup excluindo - em processamento
            if(getSuccess.statusLabel == "FREEING") {
                $('#msg-delete-backup-wait').removeClass('hide');
                // links agendamento
                $('#create-scheduling').addClass('disabled');
                $('#change-scheduling').addClass('disabled');
                $('.cancel-request').addClass('disabled');
                box.parentIframeAdjust($('#container')[0].offsetHeight);
            }

            // backup excluindo - completo
            if(getSuccess.statusLabel == "FREE_COMPLETED") {
                $('#msg-delete-backup-ok .backupName').html($('.current .desc .backupName').text());
                $('#msg-delete-backup-ok').removeClass('hide');

                $('.backup').not('.hide').addClass('hide');
                $('.backup.creating').removeClass('hide');

                // controle box de backups
                if (getSuccess.backupData.isAutoScheduled === "true") {
                    $('.backup.creating').addClass('hide');
                    $('.backup.processing').addClass('hide');
                    $('.backup.current').removeClass('hide');
                    $('.backup-schedule').addClass('hide');
                    $('.last-backup').addClass('hide');
                    $('.auto-scheduled').removeClass('hide');
                    // links agendamento
                    $('.li-change').removeClass('hide');
                    $('.li-cancel').removeClass('hide');
                    $('.li-schedule').addClass('hide');
                    // links imediato
                    $('.li-create').removeClass('hide');
                    $('.li-update').addClass('hide');
                    $('.li-restore').addClass('hide');
                    $('.li-delete').addClass('hide');
                    // atualiza informações de data e horário de criação do backup
                    $('.created-date').html(getSuccess.backupData.date);
                    $('.created-hour').html(getSuccess.backupData.hour);
                    $('.next-frequency').html(getSuccess.backupData.frequencyLabel);

                    // atualiza link para possível mensagem de erro
                    $('.action-try').addClass('btn-schedule');
                    $('.action-try').removeClass('backup-create');
                    // exibe recorrência se ela existir
                    // if (getSuccess.backupData.frequencyValue !== $.trim("ONCE")) {
                    //     $('.backup-frequency').removeClass('hide');
                    // } else {
                    //     $('.backup-frequency').addClass('hide');
                    // }
                } else {
                    $('.backup.creating').removeClass('hide');
                    $('.backup.processing').addClass('hide');
                    $('.backup.current').addClass('hide');
                    // links agendamento
                    $('.li-change').addClass('hide');
                    $('.li-cancel').addClass('hide');
                    $('.li-schedule').removeClass('hide');
                    // atualiza link para possível mensagem de erro
                    $('.action-try').removeClass('btn-schedule');
                    $('.action-try').addClass('backup-create');
                }

                // links agendamento
                $('#create-scheduling').removeClass('disabled');
                $('#change-scheduling').removeClass('disabled');
                $('.cancel-request').removeClass('disabled');
                // atualiza valor sobre backup agendado
                $('.cloud-skin input[name^=scheduled]').val(getSuccess.backupData.isAutoScheduled);
                // iguala height dos elementos
                box.copyHeight('.backup', '.load-balancing');
                // confirmacao
                box.acknowledgeBackup(getSuccess.backupData.id, 'backup');
            }

            // backup exclusao - erro
            if(getSuccess.statusLabel == "FREE_FAILED") {
                $('#msg-delete-backup-error').removeClass('hide');

                $('.backup').not('.hide').addClass('hide');
                $('.backup.current').removeClass('hide');
                $('.backup.current .desc')
                    .find('strong.backupName').html(getSuccess.backupData.name)
                    .find('p cite').html(getSuccess.backupData.description);

                // controla links do combo
                $('.li-create').addClass('hide');
                $('.li-update').removeClass('hide');
                $('.li-restore').removeClass('hide');
                $('.li-delete').removeClass('hide');

                // caso tenha bkp agendado
                if (getSuccess.backupData.isAutoScheduled === "true") {
                    $('.li-schedule').addClass('hide');
                    $('.li-change').removeClass('hide');
                    $('.li-cancel').removeClass('hide');
                    $('.backup-schedule').addClass('hide');
                    $('.auto-scheduled').removeClass('hide');
                } else {
                    $('.li-schedule').removeClass('hide');
                    $('.li-change').addClass('hide');
                    $('.li-cancel').addClass('hide');
                    $('.backup-schedule').removeClass('hide');
                    $('.auto-scheduled').addClass('hide');
                }

                // links agendamento
                $('#create-scheduling').removeClass('disabled');
                $('#change-scheduling').removeClass('disabled');
                $('.cancel-request').removeClass('disabled');

                // atualização de data e horário
                $('.created-date').html(getSuccess.backupData.date);
                $('.created-hour').html(getSuccess.backupData.hour);
                // confirmacao
                box.acknowledgeBackup(getSuccess.backupData.id, 'backup');
            }

            // backup atualizando - fila
            if(getSuccess.statusLabel == "REPLACE_BACKUP_REQUESTED") {
                $('#msg-update-backup-queue').removeClass('hide');
                // links agendamento
                $('#create-scheduling').addClass('disabled');
                $('#change-scheduling').addClass('disabled');
                $('.cancel-request').addClass('disabled');
                box.parentIframeAdjust($('#container')[0].offsetHeight);
            }

            // backup atualizando - em processamento
            if(getSuccess.statusLabel == "REPLACE_BACKING_UP") {
                $('#msg-update-backup-wait').removeClass('hide');
                // links agendamento
                $('#create-scheduling').addClass('disabled');
                $('#change-scheduling').addClass('disabled');
                $('.cancel-request').addClass('disabled');
                box.parentIframeAdjust($('#container')[0].offsetHeight);
            }

            // backup atualizando - completo
            if(getSuccess.statusLabel == "REPLACE_BACKUP_COMPLETED") {
                $('#msg-update-backup-ok strong').html(getSuccess.backupData.name);
                $('#msg-update-backup-ok').removeClass('hide');


                $('.backup').not('.hide').addClass('hide');
                $('.backup.current').removeClass('hide');
                $('.backup.current .desc')
                    .find('strong.backupName').html(getSuccess.backupData.name)
                    .find('p cite').html(getSuccess.backupData.description);

                // atualiza informações de data e horário de criação do backup
                $('.created-date').html(getSuccess.backupData.date);
                $('.created-hour').html(getSuccess.backupData.hour);

                // controla links do combo
                $('.li-create').addClass('hide');
                $('.li-update').removeClass('hide');
                $('.li-restore').removeClass('hide');
                $('.li-delete').removeClass('hide');

                // caso tenha bkp agendado
                if (getSuccess.backupData.isAutoScheduled === "true") {
                    $('.li-schedule').addClass('hide');
                    $('.li-change').removeClass('hide');
                    $('.li-cancel').removeClass('hide');
                    $('.backup-schedule').addClass('hide');
                    $('.auto-scheduled').removeClass('hide');
                } else {
                    $('.li-schedule').removeClass('hide');
                    $('.li-change').addClass('hide');
                    $('.li-cancel').addClass('hide');
                    $('.backup-schedule').removeClass('hide');
                    $('.auto-scheduled').addClass('hide');
                }

                // links agendamento
                $('#create-scheduling').removeClass('disabled');
                $('#change-scheduling').removeClass('disabled');
                $('.cancel-request').removeClass('disabled');

                // atualiza valor sobre backup agendado
                $('.cloud-skin input[name^=scheduled]').val(getSuccess.backupData.isAutoScheduled);
                // confirmacao
                box.acknowledgeBackup(getSuccess.backupData.id, 'backup');
            }

            // backup atualizando - erro
            if(getSuccess.statusLabel == "REPLACE_BACKUP_FAILED") {
                $('#msg-update-backup-error .backupName').html(getSuccess.backupData.name);
                $('#msg-update-backup-error').removeClass('hide');

                $('.backup').not('.hide').addClass('hide');
                $('.backup.current').removeClass('hide');
                $('.backup.current .desc')
                    .find('strong.backupName').html(getSuccess.backupData.name)
                    .find('p cite').html(getSuccess.backupData.description);

                // controla links do combo
                $('.li-create').addClass('hide');
                $('.li-update').removeClass('hide');
                $('.li-restore').removeClass('hide');
                $('.li-delete').removeClass('hide');

                // caso tenha bkp agendado
                if (getSuccess.backupData.isAutoScheduled === "true") {
                    $('.li-schedule').addClass('hide');
                    $('.li-change').removeClass('hide');
                    $('.li-cancel').removeClass('hide');
                    $('.backup-schedule').addClass('hide');
                    $('.auto-scheduled').removeClass('hide');
                } else {
                    $('.li-schedule').removeClass('hide');
                    $('.li-change').addClass('hide');
                    $('.li-cancel').addClass('hide');
                    $('.backup-schedule').removeClass('hide');
                    $('.auto-scheduled').addClass('hide');
                }

                // links agendamento
                $('#create-scheduling').removeClass('disabled');
                $('#change-scheduling').removeClass('disabled');
                $('.cancel-request').removeClass('disabled');

                // atualização de data e horário
                $('.created-date').html(getSuccess.backupData.date);
                $('.created-hour').html(getSuccess.backupData.hour);
                // confirmacao
                box.acknowledgeBackup(getSuccess.backupData.id, 'backup');
            }


            // backup restaurando - em processamento
            if(getSuccess.statusLabel == "RESTORING") {
                $('#msg-restore-backup-wait').removeClass('hide');
                // links agendamento
                $('#create-scheduling').addClass('disabled');
                $('#change-scheduling').addClass('disabled');
                $('.cancel-request').addClass('disabled');
            }

            // backup restaurando - completo
            if(getSuccess.statusLabel == "RESTORE_COMPLETED") {
                $('#msg-restore-backup-ok .backupName').html(getSuccess.backupData.name);
                $('#msg-restore-backup-ok').removeClass('hide');

                // controla box de backups
                $('.backup').not('.hide').addClass('hide');
                $('.backup.current').removeClass('hide');
                // links imediato
                $('.li-create').addClass('hide');
                $('.li-update').removeClass('hide');
                $('.li-restore').removeClass('hide');
                $('.li-delete').removeClass('hide');

                // caso tenha bkp agendado
                if (getSuccess.backupData.isAutoScheduled === "true") {
                    $('.backup-schedule').addClass('hide');
                    $('.auto-scheduled').removeClass('hide');
                    $('.li-schedule').addClass('hide');
                    $('.li-change').removeClass('hide');
                    $('.li-cancel').removeClass('hide');
                    // atualiza informações de data e horário de criação do backup
                    $('.created-date').html(getSuccess.backupData.date);
                    $('.created-hour').html(getSuccess.backupData.hour);
                    $('.next-frequency').html(getSuccess.backupData.frequencyLabel);
                    // exibe recorrência se ela existir
                    if (getSuccess.backupData.frequencyValue !== "ONCE") {
                        $('.next-frequency').removeClass('hide');
                    } else {
                        $('.next-frequency').addClass('hide');
                    }
                } else {
                    $('.auto-scheduled').addClass('hide');
                    $('.backup-schedule').removeClass('hide');
                    $('.li-change').addClass('hide');
                    $('.li-cancel').addClass('hide');
                    $('.li-schedule').removeClass('hide');
                }

                // links agendamento
                $('#create-scheduling').removeClass('disabled');
                $('#change-scheduling').removeClass('disabled');
                $('.cancel-request').removeClass('disabled');

                // iguala height dos elementos
                box.copyHeight('.backup', '.load-balancing');
                // confirmacao
                box.acknowledgeBackup(getSuccess.backupData.id, 'backup');
            }

            // backup restaurando - erro
            if(getSuccess.statusLabel == "RESTORE_FAILED") {
                $('#msg-restore-backup-error .backupName').html(getSuccess.backupData.name);
                $('#msg-restore-backup-error').removeClass('hide');

                // controla box bkps
                $('.backup').not('.hide').addClass('hide');
                $('.backup.current').removeClass('hide');
                // controla links do combo
                $('.li-create').addClass('hide');
                $('.li-update').removeClass('hide');
                $('.li-restore').removeClass('hide');
                $('.li-delete').removeClass('hide');

                // caso tenha bkp agendado
                if (getSuccess.backupData.isAutoScheduled === "true") {
                    $('.li-schedule').addClass('hide');
                    $('.li-change').removeClass('hide');
                    $('.li-cancel').removeClass('hide');
                    $('.backup-schedule').addClass('hide');
                    $('.auto-scheduled').removeClass('hide');
                } else {
                    $('.li-schedule').removeClass('hide');
                    $('.li-change').addClass('hide');
                    $('.li-cancel').addClass('hide');
                    $('.backup-schedule').removeClass('hide');
                    $('.auto-scheduled').addClass('hide');
                }

                // links agendamento
                $('#create-scheduling').removeClass('disabled');
                $('#change-scheduling').removeClass('disabled');
                $('.cancel-request').removeClass('disabled');

                // confirmacao
                box.acknowledgeBackup(getSuccess.backupData.id, 'backup');
            }

            // criando template
            if (getSuccess.statusLabel === "TEMPLATING_UP" || getSuccess.statusLabel === "TEMPLATE_REQUESTED") {
                $('#msg-create-template-wait').removeClass('hide');
                // links agendamento
                $('#create-scheduling').addClass('disabled');
                $('#change-scheduling').addClass('disabled');
                $('.cancel-request').addClass('disabled');
                box.parentIframeAdjust($('#container')[0].offsetHeight);
            }

            // template criado
            if (getSuccess.statusLabel === "TEMPLATE_COMPLETED") {
                $('#msg-create-template-ok').removeClass('hide');
                // links agendamento
                $('#create-scheduling').removeClass('disabled');
                $('#change-scheduling').removeClass('disabled');
                $('.cancel-request').removeClass('disabled');
                box.parentIframeAdjust($('#container')[0].offsetHeight);
                // confirmacao
                box.acknowledgeBackup(getSuccess.instanceId, 'template');
            }

            // falha ao criar template
            if (getSuccess.statusLabel === "TEMPLATE_FAILED") {
                $('#msg-create-template-error').removeClass('hide');
                // links agendamento
                $('#create-scheduling').removeClass('disabled');
                $('#change-scheduling').removeClass('disabled');
                $('.cancel-request').removeClass('disabled');
                box.parentIframeAdjust($('#container')[0].offsetHeight);
                // confirmacao
                box.acknowledgeBackup(getSuccess.instanceId, 'template');
            }

            // instalando template
            if (getSuccess.statusLabel === "SERVER_INSTALLING") {
                $('#msg-installing-template').removeClass('hide');
                // links agendamento
                $('#create-scheduling').addClass('disabled');
                $('#change-scheduling').addClass('disabled');
                $('.cancel-request').addClass('disabled');
                box.parentIframeAdjust($('#container')[0].offsetHeight);
            }

            // template instalado
            if (getSuccess.statusLabel === "SERVER_INSTALL_COMPLETED") {
                $('#msg-installed-template').removeClass('hide');
                // links agendamento
                $('#create-scheduling').removeClass('disabled');
                $('#change-scheduling').removeClass('disabled');
                $('.cancel-request').removeClass('disabled');
                box.parentIframeAdjust($('#container')[0].offsetHeight);
                // confirmacao
                box.acknowledgeBackup(getSuccess.instanceId, 'template');
            }

            box.parentIframeAdjust($('#container')[0].offsetHeight);
            box.copyHeight('.status','.system-installed','.access','.external-disks', '.backup', '.load-balancing');
        }

        // Sistema instalado
        var systemImages = ['21d7246b-c192-406c-8fca-eb89a70ada4d','21d7246b-c192-406c-8fca-eb89a70ada4f','21d7246b-c192-406c-8fca-eb89a70ada50','21d7246b-c192-406c-8fca-eb89a70ada51','21d7246b-c192-406c-8fca-eb89a70ada52','21d7246b-c192-406c-8fca-eb89a70ada53','21d7246b-c192-406c-8fca-eb89a70ada54'];
        var systemDescription = ['<span class="centos" title="">CentOS <cite>- 32 bits</cite></span>','<span class="ubuntu" title="">Ubuntu <cite>- 32 bits</cite></span>','<span class="ubuntu" title="">Ubuntu <cite>- 64 bits</cite></span>','<span class="win" title="">Win 2003 <cite>- 32 bits</cite></span>','<span class="win" title="">Win 2003 <cite>- 64 bits</cite></span>','<span class="win" title="">Win 2008 <cite>- 32 bits</cite></span>','<span class="win" title="">Win 2008 <cite>- 64 bits</cite></span>'];
        var image, txt_td;

        for(image in systemImages) {
            if(systemImages[image] == getSuccess.image) {
                $('dl.system-installed dd').eq(0).html(systemDescription[image]);
                $('dl.system-installed dd span').attr('title',getSuccess.imageDescription);
            }
        }

        // Desligado
        if(getSuccess && getSuccess.statusLabel == "STOPPED") {
            $('dl.status dd').eq(0).html('Desligado');
            box.enableAllElements(box.MANAGE_SERVER_ELEMENTS,[], box.MANAGE_SERVER_FLAGS, getSuccess);
            box.hideAllMessages();

            // sucesso upgrade downgrade
            if(getSuccess.status == "STOPR") {
                if(parseInt(getSuccess.planNumber, 10) < parseInt($('#planName').attr('rel'), 10)) {
                    $('#msg-down-ok-callback').removeClass('hide');
                } else {
                    $('#msg-up-ok-callback').removeClass('hide');
                }
                // verificação para ver se o ip nativo já foi criado
                if($('.ips tbody tr:first td.central:first').text().indexOf('Definindo') >= 0){
                    txt_td = $('.ips tbody tr:first td.central:first').html();
                    txt_td = txt_td.replace('Definindo',getSuccess.planDetails.ip);
                    $('.ips tbody tr:first td.central:first').html(txt_td);
                    $('.ips tbody tr:first td:last a').attr('rel',getSuccess.planDetails.ipId);
                }
                // detalhes do servidor
                $('#planName').attr('rel',getSuccess.planNumber).html(getSuccess.planName);
                $('#createAt').html(getSuccess.planDetails.createdAt);
                $('#memory').html(getSuccess.planDetails.memory);
                $('#cpu').html(getSuccess.planDetails.processor);
                $('#disk').html(getSuccess.planDetails.storage);
                $('#io').html(getSuccess.planDetails.io);
                $('#band').html(getSuccess.planDetails.bandwidth);
                $('#ip').html(getSuccess.planDetails.ip);
            } else {
                $('#msg-disconnect-ok').removeClass('hide');
            }
            if (!$('div.reboot').hasClass('hide')) {
                $('div.reboot').addClass('hide');
            }

            // BACKUP
            $('.backup').not('.hide').addClass('hide');
            $('.backup.current').removeClass('hide');
            $('.backup.current .desc')
                .find('strong.backupName').html(getSuccess.backupData.name)
                .find('p cite').html(getSuccess.backupData.description);

            // atualiza informações de data e horário de criação do backup
            $('.created-date').html(getSuccess.backupData.date);
            $('.created-hour').html(getSuccess.backupData.hour);

            // controla links do combo
            $('.li-create').addClass('hide');
            $('.li-update').removeClass('hide');
            $('.li-restore').removeClass('hide');
            $('.li-delete').removeClass('hide');

            // caso tenha bkp agendado
            if (getSuccess.backupData.isAutoScheduled === "true") {
                $('.li-schedule').addClass('hide');
                $('.li-change').removeClass('hide');
                $('.li-cancel').removeClass('hide');
                $('.backup-schedule').addClass('hide');
                $('.auto-scheduled').removeClass('hide');
            } else {
                $('.li-schedule').removeClass('hide');
                $('.li-change').addClass('hide');
                $('.li-cancel').addClass('hide');
                $('.backup-schedule').removeClass('hide');
                $('.auto-scheduled').addClass('hide');
            }

            // atualiza valor sobre backup agendado
            $('.cloud-skin input[name^=scheduled]').val(getSuccess.backupData.isAutoScheduled);

            // links agendamento
            $('#create-scheduling').removeClass('disabled');
            $('#change-scheduling').removeClass('disabled');
            $('.cancel-request').removeClass('disabled');
            $('#disconnect-server').addClass('hide');
            $('#connect-server').removeClass('hide');
            box.parentIframeAdjust($('#container')[0].offsetHeight);
            clearInterval(box.CONTROL_INTERVAL);
            box.CONTROL_INTERVAL = null;
        }

        // Ligado
        if(getSuccess && getSuccess.statusLabel == "RUNNING") {
            $('dl.status dd').eq(0).html('Ligado');
            box.enableAllElements(box.MANAGE_SERVER_ELEMENTS,[], box.MANAGE_SERVER_FLAGS, getSuccess);
            box.LAST_MESSAGE = box.hideAllMessages();
            // verificação para ver se o ip nativo já foi criado
            if($('.ips tbody tr:first td.central:first').text().indexOf('Definindo') >= 0){
                txt_td = $('.ips tbody tr:first td.central:first').html();
                txt_td = txt_td.replace('Definindo',getSuccess.planDetails.ip);
                $('.ips tbody tr:first td.central:first').html(txt_td);
                $('.ips tbody tr:first td:last a').attr('rel',getSuccess.planDetails.ipId);
            }
            // verificação para ver se o ip nativo já foi criado
            if($('.ips tbody tr:first td.central:first').text().indexOf('Definindo') >= 0){
                txt_td = $('.ips tbody tr:first td.central:first').html();
                txt_td = txt_td.replace('Definindo',getSuccess.planDetails.ip);
                $('.ips tbody tr:first td.central:first').html(txt_td);
                $('.ips tbody tr:first td:last a').attr('rel',getSuccess.planDetails.ipId);
            }
            if (getSuccess.publicAddressesIp !== "") {
                if ($(".ligar-servidor").hasClass('hide')) {
                    box.atualizaIpPublico(getSuccess.publicAddresses, getSuccess.publicAddressesIp, getSuccess.statusAdditionalAddress);
                } else {
                    box.atualizaIpPublico(getSuccess.publicAddresses, getSuccess.publicAddressesIp, getSuccess.statusAdditionalAddress);
                }
            }

            // tratamento para instalando
            if(box.LAST_MESSAGE == 'msg-installing-wait') {
                $('#msg-installing-ok').removeClass('hide');
            // tratamento para rebooting
            } else if(box.LAST_STATUS == 'REBOOTING') {
                $('#msg-restart-ok').removeClass('hide');
            } else {
                $('#msg-connect-ok').removeClass('hide');
            }

            if (!$('div.reboot').hasClass('hide')) {
                $('div.reboot').addClass('hide');
            }

            // links agendamento
            $('#create-scheduling').removeClass('disabled');
            $('#change-scheduling').removeClass('disabled');
            $('.cancel-request').removeClass('disabled');

            $('#connect-server').addClass('hide');
            $('#disconnect-server').removeClass('hide');
            box.parentIframeAdjust($('#container')[0].offsetHeight);
            clearInterval(box.CONTROL_INTERVAL);
            box.CONTROL_INTERVAL = null;
        }

        //vm pre-instalada
        if(getSuccess && getSuccess.statusLabel == "DEPLOY_MIGRATING") {
            box.disableAllElements(box.MANAGE_SERVER_ELEMENTS, box.MANAGE_SERVER_FLAGS);
            $("#msg-deploy-ok").removeClass('hide');

            // links agendamento
            $('#create-scheduling').removeClass('disabled');
            $('#change-scheduling').removeClass('disabled');
            $('.cancel-request').removeClass('disabled');
            box.parentIframeAdjust($('#container')[0].offsetHeight);
            clearInterval(box.CONTROL_INTERVAL);
            box.CONTROL_INTERVAL = null;
        }

        // error
        box.errorHandler('#msg-connect-error', getError, genericError, sessionStatus, box.CONTROL_INTERVAL);
    };


    /**
    * Submete o usuário para a página de comparação de planos no upgrade ou downgrade
    *
    * @method choiceNewPlan
    * @param {undefined} este método não recebe qualquer parâmetro
    * @return {undefined} este método não traz qualquer retorno
    */
    box.choiceNewPlan = function() {
        $('.downgrade').add('.upgrade').add('.bt-plan').click(function(e) {
            e.preventDefault();
            if($(this).hasClass('disabled')) { return false; }
            $(this).attr('href','#').addClass("disabled");
            $('#fieldaction').attr('value','confirmation');
            $('#fieldvalue').attr('value',$(this).attr('rel'));
            $('#fieldmessage').attr('value',$(this).attr('rev'));
            $('#manage').submit();
        });
    };

    /**
    * Habilita o botao de confirmacao, se o termo de uso for aceito
    *
    * @method agreeTerms
    * @param {string} checkbox gatilho para ativar a chaamda
    * @param {string} elem elemento que sera habilitado / desabilitado
    * @param {string} classe contem a aparencia do item desabilitado
    * @return {undefined} este método não traz qualquer retorno
    */
    box.agreeTerms = function(checkbox,elem,classe) {
        $(checkbox).unbind().click(function() {
            if($(this).attr('checked') == 'checked') {
                 $(elem).removeClass(classe);
            } else {
                 $(elem).addClass(classe);
            }
        });
    };

    /**
    * Exibe / oculta a caixa de termos de uso do produto
    *
    * @method showTermsOfUse
    * @param {string} link elemento que invocara a acao
    * @param {string} textarea elemento que sera exibido
    * @return {bool} retorna false para nao seguir o hyperlink
    */
    box.showTermsOfUse = function(link,textarea) {
        $(link).toggle(function() {
            $(textarea).removeClass('hide');
            box.parentIframeAdjust($('#container')[0].offsetHeight);
            return false;
        },
        function() {
            $(textarea).addClass('hide');
            box.parentIframeAdjust($('#container')[0].offsetHeight);
            return false;
        });
    };


    /**
    * Processa a chamada da alteracao de planos
    *
    * @method confirmUpgradeDowngrade
    * @param {undefined} este método não recebe qualquer parâmetro
    * @return {undefined} este método não traz qualquer retorno
    */
    box.confirmUpgradeDowngrade = function() {
        $('.upgrade').add('.downgrade').unbind().click(function() {
            if($('#fieldagree:checked').length == 1) {
                tb_show('Processando','#TB_inline?height=115&width=450&inlineId=msgWait&modal=true',null);
                box.heightModal();
                // #product_id só tem para fracionado, nesse caso muda o submit para ir direto para o feedback
                if ($('#product_id').size() >= 1 ){
                    $('#manage').attr('action', '/virtual-machines/servers/swap-plan/feedback/');
                    $('#manage').submit();
                }else{
                    $('form').attr('action', $('form').attr('action') + $('input[name=code_swap]').val());
                    $('#changeplan').submit();
                }
            }
        });
    };


    /**
    * Exibe a senha do usuário
    *
    * @method showPassword
    * @param {undefined} este método não recebe qualquer parâmetro
    * @return {undefined} este método não traz qualquer retorno
    */
    box.showPassword = function(elem){
        $(elem).click(function(e){
            e.preventDefault();
            var elem = $(this);
            elem.next().text(elem.attr('rel'));
            elem.hide();
            box.CONTROL_TIME_OUT = setTimeout(function(){
                elem.show().next().text('');
                clearTimeout(box.CONTROL_TIME_OUT);
            }, box.TIME_LATENCY);
        });
    };


    /**
    * Desabilita elementos da interface durante requisições ajax
    *
    * @method disableAllElements
    * @param {array} allElements elementos que serão desabilitados
    * @param {array} exceptionElements elementos que não serão desabilitados
    * @return {undefined} este método não traz qualquer retorno
    */
    box.disableAllElements = function(allElements, exceptionElements) {
        var x;

        for(x in allElements) {
            if(!box.inArray(exceptionElements,allElements[x])) {
                $(allElements[x]).attr('href','#').addClass("disabled");
                $(allElements[x]).parents('.item').addClass("disabled");
                //console.log($(allElements[x]));
            }
        }
    };

    /**
    * Habilita elementos da interface após o encerramento das requisições ajax
    *
    * @method enableAllElements
    * @param {array} allElements todos os elementos que serão habilitados
    * @param {array} exceptionElements elementos que não serão habilitados
    * @param {array} keyStatus chave correspondente a flag da API
    * @param {object} jsonResponse objeto json contendo a última resposta da API
    * @return {undefined} este método não traz qualquer retorno
    */
    box.enableAllElements = function(allElements, exceptionElements, keyStatus, jsonResponse) {
        var x,
            key;

        for(x in allElements) {
            if(box.inArray(exceptionElements,allElements[x]) === false && jsonResponse[keyStatus[x]] == "true") {
                $(allElements[x]).attr('href','#').removeClass("disabled");
                $(allElements[x]).parents('.item').removeClass("disabled");
                // console.log('ON: ' + allElements[x] + " :" + keyStatus[x] + " : " + jsonResponse[keyStatus[x]] + " : " + typeof(jsonResponse[keyStatus[x]]));
            } else {
                key = keyStatus[x].split(".");
                if(key.length >= 2) {
                    if(jsonResponse[key[0]][key[1]] == "true") {
                        $(allElements[x]).attr('href','#').removeClass("disabled");
                    }
                } else {
                    $(allElements[x]).attr('href','#').addClass("disabled");
                    $(allElements[x]).parents('.item').addClass("disabled");
                }
                // console.log('OFF: ' + allElements[x] + " :" + keyStatus[x] + " : " + jsonResponse[keyStatus[x]] + " : " + typeof(jsonResponse[keyStatus[x]]));
            }
        }
    };

    /**
    * Desenha um gráfico de donut.
    *
    * @method plotDonuts
    * @param {json} container id do elemento onde será desenhado
    * @return {undefined} este método não traz qualquer retorno
    */
    box.plotDonuts = function () {
        var codeServer = ['idtServer='+$('#fieldvalue').val()];
        box.ajaxJson('/virtual-machines/servers/edit/donuts.json', codeServer.join('&'), { method: 'POST', fnSuccess: box.plotDonutsSuccess, fnError: box.genericCallbackError });
    };

    /**
    * caputura dados da API para cada um dos Donut
    *
    * @method plotDonutsSuccess
    * @param {object} j retorna o objeto json para manipulação
    * @return {undefined} este método não traz qualquer retorno
    */
    box.plotDonutsSuccess = function(j) {
        var cpu = j.cpu || false;
        var net = j.net || false;
        var io = j.io || false;
        // var error = j.error || false;

        if (cpu){
            box.plotDonut('donut_cpu', parseFloat(cpu.used), parseFloat(cpu.free), cpu.level);
            if (cpu.alert === true){
                box.donutAlert('#donut_cpu', 'cpu', parseFloat(cpu.currentValue));
            }
            if (cpu.level !== "NOTHING") {
                $('#donut_cpu').parent().find('.counter b').html(cpu.used.toString().replace('.',','));
            }
        }
        if (net) {
            box.plotDonut('donut_trafego', parseFloat(net.used), parseFloat(net.free), net.level);
            if (net.alert === true) {
                box.donutAlert('#donut_trafego', 'trafego', parseFloat(net.currentValue));
            }
            if (net.level !== "NOTHING") {
                $('#donut_trafego').parent().find('.counter b').html(net.currentValue.toString().replace('.',','));
            }
        }
        if (io){
            box.plotDonut('donut_disco', parseFloat(io.used), parseFloat(io.free), io.level);
            if (io.alert === true){
                box.donutAlert('#donut_disco', 'io', parseFloat(io.currentValue));
            }
            if (io.level !== "NOTHING") {
                $('#donut_disco').parent().find('.counter b').html(io.used.toString().replace('.',','));
            }
        }
    };

    /**
    * caso haja necessidade de alertar sobre uma leitura
    *
    * @method donutAlert
    * @param {string} id - do elemento de escopo
    * @param {string} type - tipo do elemento
    * @param {string} used - valor usado
    * @return {undefined} este método não traz qualquer retorno
    */
    box.donutAlert = function(id, type, used){
        var text;
        $(id).parent().addClass('alert');
        used = used.toString().replace('.',',');

        if (type === "cpu") {
            text = '<b>Atenção:</b> Você está utilizando ' + used + '% da capacidade de processamento do servidor (CPU).';
        } else if (type === "trafego") {
            text = '<b>Atenção:</b> Sua máquina está com intenso tráfego de rede (' + used + 'Mb/s).';
        } else if (type === "io") {
            text = '<b>Atenção:</b> Você está utilizando ' + used + '% da capacidade de operações do disco (I/O).';
        }

        //$(id).parent().find('.donutTooltip').qtip({
        $(id).parent().qtip({
            content: text,
            position: {
                corner: {
                    target: 'topMiddle',
                    tooltip: 'bottomMiddle'
                }
            },
            style: {
                background: '#fff2b8',
                color: '#464646',
                fontSize: 13,
                fontFamily: 'arial',
                border: {
                    width: 1,
                    radius: 6,
                    color: '#fff2b8'
                },
                padding: 0,
                textAlign: 'left',
                width: 215,
                tip: true, // Give it a speech bubble tip with automatic corner detection
                name: 'cream' // Style it according to the preset 'cream' style
            }
        });
    };

    /**
    * Desenha um gráfico de donut.
    *
    * @method plotDonut
    * @param {string} container id do elemento onde será desenhado
    * @param {integer} used porcentagem utilizada
    * @param {integer} free porcentagem não utilizada
    * @param {string} level nivel de cor
    * @return {undefined} este método não traz qualquer retorno
    */
    box.plotDonut = function (container, used, free, level) {
        var colors = ['#3ea201','#f3ae1a','#e05024','#CCC','rgba(255, 255, 255, 0)'],
            // categories = [],
            // name = '',
            data = [];

            if (level === "NOTHING"){
                data = [{
                    color: colors[3] ,
                    drilldown: {
                        categories: 'Erro',
                        data: '100'
                    }
                }];

            } else {
                data = [{
                    color: (level === "OK") ? colors[0] : (level === "WARNING") ? colors[1] : (level === "CRITICAL") ? colors[2] : colors[3],
                    drilldown: {
                        categories: 'Usado',
                        data: (used < 100) ? used : 100
                    }
                }, {

                    color: colors[4],
                    drilldown: {
                        categories: 'Livre',
                        data: (free > 0) ? free : 0
                    }
                }];
            }


        // Build the data arrays
        var usedData = [],
            i,
            len;
        for (i = 0, len = data.length; i < len; i++) {

            // add data
            usedData.push({
                name: data[i].drilldown.categories,
                y: data[i].drilldown.data,
                color: Highcharts.Color(data[i].color).brighten(0).get()
            });
        }

        // Create the chart
        var chart = new Highcharts.Chart({
            chart: {
                renderTo: container,
                plotBackgroundColor: colors[4],
                backgroundColor: colors[4],
                borderColor: colors[4],
                type: 'pie'
            },
            title: {
                text: ''
            },
            plotOptions: {
                pie: {
                    shadow: false,
                    enableMouseTracking: false,
                    borderColor: colors[4],
                    animation: false,
                    innerSize: '64%',
                    size: '108%'
                }
            },
            tooltip: {
                formatter: function() {
                    return false;//'<b>'+ this.point.name +'</b>: '+ this.y +' %';
                }
            },
            exporting: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            series: [{
                name: 'Versions',
                data: usedData,
                dataLabels: {
                    enabled: false
                }
            }]
        });

        if(chart) { return true; }
    };

    /**
    * Botão para desativar e realizar ativacao de IP Privado
    *
    * @method updateStatusIp
    * @param {undefined} este método não recebe qualquer parâmetro
    * @return {undefined} este método não traz qualquer retorno
    */
    box.updateStatusIp = function(button) {
        $(button).unbind().click(function () {
            if($(this).hasClass('disabled')) { return false; }
            box.hideAllMessages();
            var codeServer = [],
                actionIp = $(this).attr("rel");
            $(this).addClass('disabled');

            codeServer.push('param=null');
            codeServer.push('actionIp='+actionIp);
            box.ajaxJson('/virtual-machines/servers/my-servers/getIp.json',
                codeServer.join('&'),
                    {
                        method: 'POST',
                        async: false,
                        fnSuccess: box.updateStatusIpSuccess,
                        fnError: box.genericCallbackError
                    }
            );
        });
    };

    /**
    * Sucesso para atualizacao do IP Privado
    *
    * @method updateStatusIpSuccess
    * @param {undefined} este método não recebe qualquer parâmetro
    * @return {undefined} este método não traz qualquer retorno
    */
    box.updateStatusIpSuccess = function(j) {
        var getSuccess = j.resume || false;
        var genericError = j.genericResponse || false;
        var invalidToken = j.instance || false;

        // success
        if(getSuccess) {
            if(getSuccess.actionIp == 'solicitarIp'){
                $(".private-available").addClass("hide");
                $("#rebootIp").removeClass("hide");
                $(".reiniciar").removeClass("hide");
            }else if (getSuccess.actionIp == 'solicitarIpDesligado'){
                $(".private-available").addClass("hide");
                $(".solicitarIpDesligado").addClass("hide");
                $("#startIP").removeClass("hide");
                // Atuliza elementos dinamicamente para ligar o servidor quando o mesmo estava delisgado e foi solicitado o Ip Privado
                $(".reiniciar").addClass('ligar-srv-desligado');
                $(".ligar-srv-desligado .reiniciar-servidor").addClass("hide");
                $(".ligar-srv-desligado .ligar-servidor").removeClass("hide");
                $(".ligar-srv-desligado").removeClass("hide");
            }
        }

        // error
        box.errorHandler('#msg-error', genericError, invalidToken, false);
    };

    /**
    * Atualiza o label quando ip privado enquanto a maquina estiver rebotando/ligando
    *
    * @method atualizaLabelIp
    * @param {undefined} este método não recebe qualquer parâmetro
    * @return {undefined} este método não traz qualquer retorno
    */
    box.atualizaLabelIp = function(label, elemento) {
        if ($(elemento).size() > 0){
            $(elemento).html(label);
        }
    };

    /**
    * Atualiza o Ip Privado do usuario
    *
    * @method atualizaIpPrivado
    * @param {status} número do ip pracionado
    * @param {elemento} quem vai receber a classe hide
    * @return {undefined} este método não traz qualquer retorno
    */
    box.atualizaIpPrivado = function(status, elemento) {
        if (status !== "") {
            $(elemento).addClass('hide');
            $(".ip-privado").removeClass('hide');
            $(".numero-ip").html(status);
        }
    };

    /**
    * Atualiza o Ip Publico do usuario após reiniciar a vm
    *
    * @method atualizaIpPublico
    * @param {ipPublico} array com os ips públicos já contratados
    * @param {idPublico} array dos id's dos ips públicos já contratados
    * @param {ipStatus}  array dos status dos ips públicos já contratados
    * @return {undefined} este método não traz qualquer retorno
    */
    box.atualizaIpPublico = function(ipPublico, idPublico, ipStatus) {
        var qtdIps    = ipPublico.length,
            qtdLinhas = $('.ips table tbody .list-ip').length-1,
            tableIp   = $('.ips table tbody'),
            i = 0,
            $line,
            $dotted;

        if(qtdIps != qtdLinhas) {
            for (i = qtdLinhas; i < qtdIps; i++) {
                if(ipStatus[i] == 'ASSIGNED') { // verificação do status do ip

                    $dotted = $('.ips table tbody tr:last').clone();
                    $line   = $('.ips table tbody .list-ip:last').clone();

                    $line
                    .find('td:eq(1)').html(ipPublico[i]).closest('tr')
                    .find('td a.manage-firewall').attr('rel', idPublico[i]);
                    tableIp.append($line);
                    tableIp.append($dotted);
                }
            }
            //$('.restart-ip').addClass('hide');
        }
    };

    box.ipAdd = (function(e){
        if ($(this).hasClass('disabled')) { return false; }
        $('.ipadd').click(function(){
            tb_show('Contratar novo IP adicional', '#TB_inline?height=150&width=480&inlineId=ip-adicional&modal=false', null);
            box.centralizeButtons("#TB_ajaxContent .actions", "#TB_ajaxContent", ".actions:visible .close");
            return false;
        });
    }());

    /**
    * Instrução para procedimentos de ativação do Ip-Privado para CentOS
    *
    * @method privateIpProcedureCentOS
    * @param {undefined} este método não recebe qualquer parâmetro
    * @return {undefined} este método não traz qualquer retorno
    */
    box.privateIpProcedureCentOS = function(button) {
        $(button).unbind().click(function (e){
            e.preventDefault();
            if ($(this).hasClass('disabled')) {return false;}

            tb_show('Procedimento de ativação para CentOS','#TB_inline?height=550&width=560&inlineId=active-ip-private-centos&modal=false',null);
            box.heightModal();
        });

        // fechar lightbox
        $('a.close').add('a#TB_closeWindowButton').add('#TB_overlay').unbind().click(function() {
            tb_remove();
            box.heightModal();
        });

        $('.choice-ip').change(function() {
            $('.pop-active-ip-centos .privado,.pop-active-ip-centos .publico').addClass('hide');
            $('.pop-active-ip-centos .'+$(this).val()).removeClass('hide');
        });
    };


    box.viewDetails = (function() {
        $('.view-details > div').off().on('click', function(e) {
            e.preventDefault();
             var that = $(this);

             if($(this).hasClass('closed')) {
                 $(this).removeClass('closed');
                 $('.details').slideDown(function () {
                    box.parentIframeAdjust($('#container')[0].offsetHeight);
                 });
             } else {
                $('.details').slideUp(function() {
                    that.addClass('closed');
                    box.parentIframeAdjust($('#container')[0].offsetHeight);
                });
             }

             box.parentIframeAdjust($('#container')[0].offsetHeight);
        });
    }());


    /**
    * Exibe um lightbox com um passo a passo de como efetuar o primeiro acesso a máquina
    *
    * @method helpAccessMachine
    * @param {undefined} este método não recebe qualquer parâmetro
    * @return {undefined} este método não traz qualquer retorno
    */
    box.helpAccessMachine = (function() {
        $('a#first-access-win').add('a#first-access-lin').unbind().click(function(e){
            e.preventDefault();
            tb_show('Como fazer o primeiro acesso:','#TB_inline?height=220&width=560&inlineId=first-access&modal=false',null);


            $('#windows').add('#linux').addClass('hide');
            if($(this).attr('id') == 'first-access-win') {
                $('#windows').removeClass('hide');
            } else {
                $('#linux').removeClass('hide');
            }
            box.centralizeButtons("#TB_ajaxContent .actions", "#TB_ajaxContent", "#TB_ajaxContent .close");

            // combo
            var combo = $('.choice-os').clone();
            $('.help-skin').parents('#TB_window').find('#TB_ajaxWindowTitle').append(combo);
            if($(this).attr('id') == 'first-access-win' && $('.choice-os option').eq(0).val() == 'windows') {
                $('.choice-os option').eq(0).attr('selected','selected');
            } else {
                $('.choice-os option').eq(1).attr('selected','selected');
            }

            $('.choice-os').removeClass('hide').unbind().change(function() {
                $('.help-skin div').each(function() {
                    if(!$(this).hasClass('hide')) { $(this).addClass('hide'); }
                });
                $('#'+$('select[class="choice-os"] option:selected').val()).removeClass('hide');
            });
            //verifica se o modal é maior que que a o conteúdo
            //
            box.heightModal();
        });
    }());

    /**
    * Envia usuário para fluxo de criação de templates
    *
    * @method submitToCreate
    * @param {string} btn dispara ação
    * @return {undefined} este método não traz qualquer retorno
    */
    box.submitToCreate = (function (btn) {
        $(btn).on('click', function (e) {
            e.preventDefault();

            if ($(this).hasClass('disabled')) {
                return false;
            }

            var codeTPL,
                idtServer   = $(this).attr('rel'),
                fieldAction = $(this).attr('id'),
                urlBack     = $(this).attr('rev'),
                formAction  = $(this).data('url');

            codeTPL = [];
            codeTPL.push('idtServer=' + idtServer);
            box.ajaxJson('/virtual-machines/servers/edit/get.json', codeTPL.join('&'), {
                method: 'POST',
                fnSuccess: function (j) {
                    var getSuccess    = j.get || false,
                        getError      = j.error || false,
                        genericError  = j.genericResponse || false,
                        sessionStatus = j.sessionStatus || false,
                        templates     = $('#qtd_templates').val();

                    if (parseInt(getSuccess.attachedDisks, 10) === 0 &&
                        getSuccess.statusLabel == "STOPPED" && templates < box.TEMPLATE_LIMIT) {
                        $('#fieldaction').val(fieldAction);
                        $('#fieldvalue').val(urlBack);
                        $('#idinstance').val(idtServer);
                        $('#manage').attr('action', formAction).submit();
                    } else {
                        tb_show('Criar template', '#TB_inline?height=210&width=560&inlineId=modal-template&modal=false', null);
                        box.heightModal();
                        $('.cloud-templates > div').addClass('hide');
                        $('.disconnect-server').add('.disconnect-disks').attr('rel', getSuccess.controlRequest);

                        if (parseInt(getSuccess.attachedDisks, 10) > 0 && getSuccess.statusLabel == "RUNNING") {
                            $('.disconnect-tpl-all').removeClass('hide');
                            box.disconnect('.disconnect-server', 'disconnect');
                        } else if (parseInt(getSuccess.attachedDisks, 10) > 0) {
                            $('.disconnect-tpl-disks').removeClass('hide');
                            box.dispatcherDetachDisks('.disconnect-disks');
                        } else if (getSuccess.statusLabel == "RUNNING") {
                            $('.disconnect-tpl').removeClass('hide');
                            box.disconnect('.disconnect-server', 'disconnect');
                        } else if (templates >= box.TEMPLATE_LIMIT) {
                            $('.max-tpl').removeClass('hide');
                        }

                        box.centralizeButtons('#TB_ajaxContent .actions', '#TB_ajaxContent', '.actions:visible .btn:first',
                            '.actions:visible .close');
                    }

                    // error
                    box.errorHandler('.exception', getError, genericError, sessionStatus, false);
                },
                fnError: function (j) {
                    box.genericCallbackError(j);
                }
            });
        });
    }('#create-template'));
};