JRPG = {
    Config : {
        version : 0.1,
        updated : 'dd/mm/yyyy 12:00 PM',
        phpTestMode : false
    },

    Defaults : {
        density : 3
    },

    systemData : {
        stars : {

        }
    },

    Methods : {
        init : function() {
            JRPG.Options = $.extend(true, JRPG.Defaults, JRPG.Options);

            JRPG.Methods.initMap();

            $(document).ready(function() {
                JRPG.Methods.documentReady();
            });
        },

        documentReady : function() {

        },

        decodeUPP : function(UPP) {
            var parsedUPP = {
                'Strength' : JRPG.Methods.hexdec(UPP.substring(0, 1)),
                'Dexterity' : JRPG.Methods.hexdec(UPP.substring(1, 2)),
                'Endurance' : JRPG.Methods.hexdec(UPP.substring(2, 3)),
                'Intelligence' : JRPG.Methods.hexdec(UPP.substring(3, 4)),
                'Education' : JRPG.Methods.hexdec(UPP.substring(4, 5)),
                'Social' : JRPG.Methods.hexdec(UPP.substring(5, 6))
            };
            return parsedUPP;
        },

        decodeUWP : function(UWP) {
            var size = (UWP.substring(0, 1) === 'S' || UWP.substring(0, 1) === 'R') ? UWP.substring(0, 1) : JRPG.Methods.hexdec(UWP.substring(0, 1));
            var parsedUWP = {
                'size' : size,
                'atmosphere' : JRPG.Methods.hexdec(UWP.substring(1, 2)),
                'hydrosphere' : JRPG.Methods.hexdec(UWP.substring(2, 3)),
                'population' : JRPG.Methods.hexdec(UWP.substring(3, 4)),
                'government' : JRPG.Methods.hexdec(UWP.substring(4, 5)),
                'law' : JRPG.Methods.hexdec(UWP.substring(5, 6))
            };
            return parsedUWP;
        },

        encodeUWP : function(size, atmos, hydro, pop, govt, law) {

            var parsedSize = (size === 'S' || size === 'R') ? size : parseInt(size, 10).toString(16).toUpperCase();
            var encodedUPP = parsedSize + parseInt(atmos, 10).toString(16).toUpperCase() + parseInt(hydro, 10).toString(16).toUpperCase() + parseInt(pop, 10).toString(16).toUpperCase() + parseInt(govt, 10).toString(16).toUpperCase() + parseInt(law, 10).toString(16).toUpperCase();

            return encodedUPP;

        },

        encodeUPP : function(str, dex, end, intel, edu, soc) {

            var encodedUPP = parseInt(str, 10).toString(16).toUpperCase() + parseInt(dex, 10).toString(16).toUpperCase() + parseInt(end, 10).toString(16).toUpperCase() + parseInt(intel, 10).toString(16).toUpperCase() + parseInt(edu, 10).toString(16).toUpperCase() + parseInt(soc, 10).toString(16).toUpperCase();

            return encodedUPP;

        },

        modifyUPP : function(attributeName, modifier) {
            var upp = sessvars.character.upp,
                attributes = JRPG.Methods.decodeUPP(upp),
                encodedUPP;
            attributes[attributeName] = attributes[attributeName] + modifier;
            if (attributes[attributeName] > 16) {
                attributes[attributeName] = 16;
            }
            if (attributes[attributeName] < 1) {
                attributes[attributeName] = 1;
            }
            encodedUPP = JRPG.Methods.encodeUPP(attributes['Strength'], attributes['Dexterity'], attributes['Endurance'], attributes['Intelligence'], attributes['Education'], attributes['Social']);
            sessvars.character.upp = encodedUPP;
        },

        hexdec : function(hex_string) {
            hex_string = (hex_string + '').replace(/[^a-f0-9]/gi, '');
            return parseInt(hex_string, 16);
        },

        d6 : function(die, mod) {
            var total = 0,
                roll;
            for (; die > 0; die--) {
                roll = Math.floor((Math.random() * 6) + 1);
                total = total + roll;

            }
            total = total + mod;
            return total;
        },
        dieRoll : function(sides, count, modifier) {
            var total = 0;
            for (; count > 0; count--) {
                var roll = Math.floor((Math.random() * sides) + 1);

                total = total + roll;
            }
            total = total + modifier;

            return total;
        },
        getQueryVariable : function(variable) {
            var query = window.location.search.substring(1);
            var vars = query.split('&');
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split('=');
                if (decodeURIComponent(pair[0]) == variable) {
                    return decodeURIComponent(pair[1]);
                }
            }
            //console.log('Query variable %s not found', variable);
        },
        initMap : function(density) {
            var rows = 10;
            for (; rows > 0; rows--) {
                for (var columns = 8; columns > 0; columns--) {
                    var rollCheck = JRPG.Methods.d6(1, 0);
                    if (rollCheck >= 4) {
                        var cellName = (rows == 10) ? columns.toString() + '10' : columns.toString() + '0' + rows.toString();
                        var star = JRPG.Methods.createSystemStatBlock();
                        star['name'] = JRPG.Methods.generateStarName(star.stats.pop, star.stats.govt);
                        star['position'] = {
                            row : rows,
                            column : columns,
                            cellname : cellName
                        };
                        //enter the star
                        JRPG.systemData.stars[cellName] = star;
                    }
                }
            }

            JRPG.Methods.printSectorTable();
            JRPG.Methods.drawMap();
            console.log(JRPG.systemData.stars);
        },
        createSystemStatBlock : function() {
            var systemStatBlock = {
                name : '',
                starport : '',
                navybase : '',
                scoutbase : '',
                militarybase : '',
                gasgiant : '',
                bases : '',
                techdm : 0,
                xboatchance : 0,
                stats : {
                    size : 0,
                    atmos : 0,
                    hydro : 0,
                    pop : 0,
                    govt : 0,
                    law : 0,
                    tech : 0
                },
                contents : {
                    gasgiants : 0
                },
                tradeclasses : [],
                UWP : '',
                colors : {
                    fill : '',
                    outline : '',
                    travelzone : 'none'
                }
            };
            var systemStats = {};

            systemStatBlock = JRPG.Methods.generateSystemContents(systemStatBlock);
            systemStats = JRPG.Methods.generateSystemStats(systemStatBlock);
            systemStatBlock.stats = systemStats;
            systemStatBlock.tradelasses = JRPG.Methods.generateTradeClassesAndColors(systemStatBlock);
            systemStatBlock.UWP = JRPG.Methods.encodeUWP(systemStatBlock.stats.size, systemStatBlock.stats.atmos, systemStatBlock.stats.hydro, systemStatBlock.stats.pop, systemStatBlock.stats.govt, systemStatBlock.stats.law);
            systemStatBlock.colors.travelzone = JRPG.Methods.determineTravelZone(systemStatBlock.stats.govt, systemStatBlock.stats.law, systemStatBlock.starport);
            return systemStatBlock;
        },
        generateSystemContents : function(systemStatBlock) {
            var starPortRoll = JRPG.Methods.d6(2, 0);
            var scouttarget = 0,
                techdm = 0,
                xboatchance = 0,
                gasgiantcount = 0,
                navybasepossible = true,
                scoutbasepossible = true,
                militarybasepossible = true;
            var starport = '',
                navybase = '',
                scoutbase = '',
                gasgiant = '',
                militarybase = '';
            var gasGiantRoll = JRPG.Methods.d6(2, 0);
            if (starPortRoll <= 4) {
                starport = 'A';
                scouttarget = 10;
                techdm = 6;
                xboatchance = 80;
            } else if (starPortRoll === 5 || starPortRoll === 6) {
                starport = 'B';
                scouttarget = 9;
                techdm = 4;
                xboatchance = 20;
            } else if (starPortRoll === 7 || starPortRoll === 8) {
                starport = 'C';
                scouttarget = 8;
                techdm = 4;
                xboatchance = 20;
                navybasepossible = false;
            } else if (starPortRoll === 9) {
                starport = 'D';
                scouttarget = 7;
                navybasepossible = false;
                militarybasepossible = false;
            } else if (starPortRoll === 10 || starPortRoll === 11) {
                starport = 'E';
                navybasepossible = false;
                scoutbasepossible = false;
                militarybasepossible = false;
            } else {
                starport = 'X';
                navybasepossible = false;
                scoutbasepossible = false;
                militarybasepossible = false;
                techdm = -4;
            }
            if (navybasepossible) {
                var navyRoll = JRPG.Methods.d6(2, 0);
                if (navyRoll >= 8) {
                    navybase = 'N';
                    xboatchance = xboatchance + 20;
                    militarybasepossible = false;
                }
            }
            if (scoutbasepossible) {
                var scoutRoll = JRPG.Methods.d6(2, 0);
                if (scoutRoll >= scouttarget) {
                    scoutbase = 'S';
                    xboatchance = xboatchance + 20;
                }
            }
            if (militarybasepossible) {
                var militarRoll = JRPG.Methods.d6(2, 0);
                if (militarRoll >= scouttarget) {
                    navybase = 'M';
                }
            }
            if (gasGiantRoll <= 5) {
                var gasGiantCountArray = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 5];
                var gasgiantcountRoll = JRPG.Methods.d6(2, 0);
                gasgiantcount = gasGiantCountArray[gasgiantcountRoll];
                gasgiant = 'G';
            }
            systemStatBlock.starport = starport;
            systemStatBlock.navybase = navybase;
            systemStatBlock.scoutbase = scoutbase;
            systemStatBlock.militarybase = militarybase;
            systemStatBlock.gasgiant = gasgiant;
            systemStatBlock.techdm = techdm;
            systemStatBlock.xboatchance = xboatchance;
            systemStatBlock.bases = navybase + militarybase + scoutbase + gasgiant;
            systemStatBlock.contents.gasgiants = gasgiantcount;

            return systemStatBlock;

        },
        generateSystemStats : function(systemStatBlock) {
            var atmosphere,
                hydrosphere,
                techlevel;
            var size = JRPG.Methods.d6(2, -2);
            var population = JRPG.Methods.d6(2, -2);
            var government = JRPG.Methods.d6(2, population - 7);
            var lawlevel = 0;
            var atmoMod = size - 7;
            var statBlock = {
                size : 0,
                atmos : 0,
                hydro : 0,
                pop : 0,
                govt : 0,
                law : 0,
                tech : 0
            };

            if (size <= 0) {
                atmosphere = 0;
            } else {

                atmosphere = JRPG.Methods.d6(2, atmoMod);
                if (atmosphere < 0) {
                    atmosphere = 0;
                }
            }
            if (size <= 1) {
                hydrosphere = 0;
            } else {
                var hydroMod = atmoMod;
                if (atmosphere <= 1 || atmosphere >= 10) {
                    hydroMod = hydroMod - 4;
                }
                hydrosphere = JRPG.Methods.d6(2, hydroMod);
                if (hydrosphere < 0) {
                    hydrosphere = 0;
                }
                if (hydrosphere > 10) {
                    hydrosphere = 10;
                }
            }

            if (population <= 0) {
                government = 0;
                lawlevel = 0;
            } else {
                if (government <= 0) {
                    government = 0;
                }
                lawlevel = JRPG.Methods.d6(2, government - 7);
                if (lawlevel < 0) {
                    lawlevel = 0;
                }
            }

            //update techdm
            if (size <= 1) {
                systemStatBlock.techdm++;
            }
            if (size <= 4) {
                systemStatBlock.techdm++;
            }//not a mistake, 1 and 0 get increased twice
            if (atmosphere <= 3 || atmosphere >= 10) {
                systemStatBlock.techdm++;
            }
            if (hydrosphere >= 9) {
                systemStatBlock.techdm++;
            }
            if (hydrosphere >= 10) {
                systemStatBlock.techdm++;
            }
            if (government == 0 || government == 5) {
                systemStatBlock.techdm++;
            } else if (government == 13) {
                systemStatBlock.techdm = systemStatBlock.techdm - 2;
            }

            techlevel = JRPG.Methods.d6(2, systemStatBlock.techdm);
            if (techlevel < 0) {
                techlevel = 0;
            }
            if (techlevel > 16) {
                techlevel = 16;
            }

            statBlock = {
                size : size,
                atmos : atmosphere,
                hydro : hydrosphere,
                pop : population,
                govt : government,
                law : lawlevel,
                tech : techlevel
            };
            return statBlock;
        },
        generateTradeClassesAndColors : function(systemStatBlock) {
            var fillColor = '#83D11B';
            var outlineColor = '';
            var tradeClasses = [];
            var stats = systemStatBlock.stats;
            //Agricultural or Non
            if (stats.atmos <= 3 && stats.hydro <= 3 && stats.pop >= 6) {
                tradeClasses.push('Na');
            } else if (stats.atmos <= 9 && stats.hydro <= 8 && stats.pop >= 5 && stats.pop <= 7) {
                tradeClasses.push('Ag');
                outlineColor = '#215E21';
            }
            //climate type items
            if (stats.size === 0) {
                tradeClasses.push('As');
                fillColor = '#EEEEEE';
            } else if (stats.size >= 10 && stats.atmos >= 1) {
                tradeClasses.push('Fl');
            }
            if (stats.atmos === 0) {
                tradeClasses.push('Va');
                fillColor = '#EEEEEE';
            } else if (stats.atmos === 1) {
                fillColor = '#EEEEEE';
            } else if (stats.atmos >= 10) {
                fillColor = '#EEEEEE';
            }
            if (stats.hydro == 0 && stats.atmos >= 2) {
                tradeClasses.push('De');
                fillColor = '#D62918';
            }
            if (stats.hydro >= 10) {
                tradeClasses.push('Wa');
                fillColor = '#0D8ADE';
            }
            if (stats.atmos <= 1 && stats.hydro >= 1) {
                tradeClasses.push('Ic');
                fillColor = '#FFFFFF';
                outlineColor = '#71BBE8';
            }

            //no pop
            if (stats.pop === 0) {
                tradeClasses.push('Ba');
            } else if (stats.pop >= 9) {
                tradeClasses.push('Hi');
                if ((stats.atmos >= 2 && stats.atmos <= 4) || stats.atmos == 7 || stats.atmos == 9) {
                    tradeClasses.push('In');
                    outlineColor = '#A67D3D';
                }
            } else if (stats.pop <= 6) {
                tradeClasses.push('Ni');
                if (stats.pop <= 3) {
                    tradeClasses.push('Lo');
                }
            }

            if (stats.atmos >= 2 && stats.atmos <= 5) {
                if (stats.hydro <= 3) {
                    tradeClasses.push('Po');
                }
            }
            if (stats.atmos === 6 || stats.atmos === 8) {
                if (stats.pop >= 6 && stats.pop <= 8) {
                    if (stats.govt >= 4 && stats.govt <= 9) {
                        tradeClasses.push('Ri');
                    }
                }
            }
            if (outlineColor === '') {
                outlineColor = fillColor;
            }
            systemStatBlock.tradeclasses = tradeClasses;
            systemStatBlock.colors = {
                fill : fillColor,
                outline : outlineColor,
                travelzone : 'none'
            };
            return systemStatBlock;
        },
        determineTravelZone : function(govt, law, starport) {
            var travelZoneTable = [];
            var travelZone = false;
            travelZoneTable[10] = [false, false, false, false, '#FFD631'];
            travelZoneTable[11] = [false, false, false, '#FFD631', '#FFD631'];
            travelZoneTable[12] = [false, false, '#FFD631', '#FFD631', '#FFD631'];
            travelZoneTable[13] = [false, '#FFD631', '#FFD631', '#FFD631', '#D62918'];
            travelZoneTable[14] = [false, '#FFD631', '#FFD631', '#D62918', '#D62918'];
            travelZoneTable[15] = ['#FFD631', '#FFD631', '#FFD631', '#D62918', '#D62918'];
            if (starport === 'X') {
                travelZone = '#D62918';
            } else if (govt >= 10 && law >= 16) {
                travelZone = travelZoneTable[govt][law];
            }
            return travelZone;

        },
        generateStarName : function(populationRoll, government) {
            var data = JRPG.Data.Names;
            var length = Math.round(Math.random()) + Math.round(Math.random());
            var firstRow = Math.floor(Math.random() * 1015);
            var name = data[firstRow][0];
            var funNameCheck = JRPG.Methods.dieRoll(6, 1, 0);
            name = name.charAt(0).toUpperCase() + name.slice(1);
            for (var i = 0; i < length; i++) {
                var randomSuffix = Math.floor(Math.random() * 422);
                var sylable = data[randomSuffix][1];
                name = name + sylable;
            }
            if (name.length > 12) {
                name = name.substr(0, 12);
            } else if (name.length === 1) {
                var letterArray = ['a', 'e', 'i', 'o', 'u', 'y'];
                var letter = Math.floor(Math.random() * 5);
                name = name + letterArray[letter];
            }
            if (populationRoll === 12) {
                name = name.replace('e', '\'');
            }
            if (populationRoll <= 3 || (populationRoll <= 6 && funNameCheck == 6)) {
                var roll = JRPG.Methods.dieRoll(6, 1, 0);
                if (roll > 5) {
                    name = "Star " + JRPG.Methods.dieRoll(10, 1, -1).toString() + JRPG.Methods.dieRoll(10, 1, -1).toString() + JRPG.Methods.dieRoll(10, 1, -1).toString() + JRPG.Methods.dieRoll(10, 1, -1).toString() + JRPG.Methods.dieRoll(10, 1, -1).toString() + JRPG.Methods.dieRoll(10, 1, -1).toString();
                } else {
                    var sylableRow = JRPG.Methods.dieRoll(50, 1, 0);
                    if (sylableRow <= 25) {
                        var noun = data[sylableRow][2];
                        name = name.substring(0, 8) + '\'s ' + noun;
                    }
                }
            }
            return name;
        },
        generateSubsectorName : function() {
            var data = JRPG.Data.Names;
            var length = Math.round(Math.random()) + Math.round(Math.random());
            var firstRow = Math.floor(Math.random() * 1015);
            var name = data[firstRow][0];
            var funNameCheck = JRPG.Methods.dieRoll(6, 1, 0);
            name = name.charAt(0).toUpperCase() + name.slice(1);
            for ( i = 0; i < length; i++) {
                var randomSuffix = Math.floor(Math.random() * 422);
                var sylable = data[randomSuffix][1];
                name = name + sylable;
            }
            if (name.length > 12) {
                name = name.substr(0, 12);
            } else if (name.length === 1) {
                var letterArray = ['a', 'e', 'i', 'o', 'u', 'y'];
                var letter = Math.floor(Math.random() * 5);
                name = name + letterArray[letter];
            }
            return name;
        },
        printSectorTable : function() {
            var stars = JRPG.systemData.stars;
            var today = new Date();
            var starTable = $('#worldDataTable tbody');

            $('#dop').text(today.getFullYear() + '.' + today.getMonth() + '.' + today.getDate());
            $('#nameSubsector').text(this.generateSubsectorName());
            $('#nameSector').text(this.generateSubsectorName());

            $.each(stars, function(hex, star) {
                var bases = (star.bases == ' ') ? '' : star.bases + ' ';
                var htmlRow = '<tr><td><a href="worlddata.html?data=' + star.UWP + '&bases='+bases.replace(' ','')+'&name=' + star.name + '&trade='+star.tradeclasses+'&starport='+star.starport+'&tech='+star.stats.tech+'" rel="' + hex + '" data-hex="' + hex + '" class="starSystemLink" data-fancybox-type="iframe">' + star.name + '</td><td>' + hex + '</td><td>' + star.starport + star.UWP + '-' + star.stats.tech + ' ' + bases + '</td><td>' + star.tradeclasses.toString() + '</td></tr>';
                starTable.append(htmlRow);

            });

        },
        drawMap : function() {
            //draw each element
            var stars = JRPG.systemData.stars;
            $.each(stars, function(hex, star) {
                JRPG.Methods.drawStar(star);
                JRPG.Methods.drawPorts(star);
                if (star.navybase === 'N') {

                }
                if (star.scoutbase === 'S') {

                }
                if (star.gasgiant) {

                }
            });
        },
        drawStar : function(planetData) {
            var map = Snap('#starMap');
            var columnBase = planetData.position.column - 1;
            var rowBase = planetData.position.row - 1;
            var colors = planetData.colors;
            var bigCircle,
                travelcircle,
                starText;
            var drawBaseY = 124.7076581449594,
                drawBaseX = 72;
            var drawX = 0,
                drawY = 0;

            if (columnBase % 2 == 0) {
                drawBaseY = 62.3538290724796;
            }
            drawX = drawBaseX + (108 * columnBase);
            drawY = drawBaseY + (124.7076581449594 * rowBase);
            //console.log(drawBaseY);
            if (planetData.stats.size === 0) {
                JRPG.Methods.drawAsteroids(drawX, drawY);
            } else {
                drawX = drawBaseX + (108 * columnBase);
                drawY = drawBaseY + (124.7076581449594 * rowBase);
                bigCircle = map.circle(drawX, drawY, 9.16);
                bigCircle.attr({
                    fill : colors.fill,
                    stroke : colors.outline,
                    strokeWidth : 2,
                    'data-grid' : planetData.position.cellname
                });
                starText = map.text(drawX, drawY + 45, planetData.name);
                starText.attr({
                    'data-hex' : planetData.position.cellname,
                    'text-anchor' : 'middle',
                    'font-family' : 'Helvetica',
                    'font-size' : '16.6',
                    'fill' : '#FFFFFF'
                });
            }

            if (colors.travelzone !== false) {
                travelcircle = map.circle(drawX, drawY, 60.16);
                travelcircle.attr({
                    fill : 'transparent',
                    stroke : colors.travelzone,
                    strokeWidth : 3
                });
            }
        },
        drawAsteroids : function(drawX, drawY) {
            var map = Snap('#starMap');
            var attributes = {
                fill : '#EEEEEE',
                stroke : '#EEEEEE',
                strokeWidth : 2
            };
            map.circle(drawX, drawY, 3.16).attr(attributes);
            map.circle(drawX + 12, drawY + 3, 2.16).attr(attributes);
            map.circle(drawX - 4, drawY - 6, 1.16).attr(attributes);
            map.circle(drawX + 4, drawY - 8, 2.16).attr(attributes);
            map.circle(drawX + 6, drawY - 2, .5).attr(attributes);
        },
        drawNavybases : function(planetData) {

        },
        drawPorts: function (planetData) {
            var map = Snap('#starMap');
            var columnBase = planetData.position.column - 1;
            var rowBase = planetData.position.row - 1;
            var drawBaseY = 101,
                drawBaseX = 39;
            if (columnBase % 2 == 0) {
                drawBaseY = 62.3538290724796;
            }
            map.text(drawBaseX, drawBaseY, planetData.starport).attr({
                'text-achor' : 'middle',
                'font-family' : 'Helvetica',
                'font-size': '21.6',
                'fill' : '#DDDDDD'
            });
        },
        worldDataDisplay: function () {
            var description = JRPG.Data.statDescriptors;
            var uwp = JRPG.Methods.decodeUWP(JRPG.Methods.getQueryVariable('data'));
            var bases = JRPG.Methods.getQueryVariable('bases');
            var starportDesc = description.starport[JRPG.Methods.getQueryVariable('starport')];
            var techlevel = JRPG.Methods.getQueryVariable('tech');
            var name = JRPG.Methods.getQueryVariable('name');
            var gasGiants = (bases.match('G') !== -1).toString();
            var baseString = bases.replace('N','Naval Base, ').replace('S','Scout Base, ').replace('M','Military Base, ').replace('G','');
            var sizeDesc = (uwp.size===0)?description.size[0]:uwp.size.toString()+',000 mile circumference';
            var atmosDesc = description.atmos[uwp.atmosphere];
            var hydroDesc = description.hydro[uwp.hydrosphere];
            var popDesc = '';
            var govtDesc = description.govt[uwp.government];
            var govtDefinition = description.govtdefinition[uwp.government];
            var law = description.law[uwp.law];
            var tech = description.tech[JRPG.Methods.getQueryVariable('tech')]; //need to add tech
            var dataHTML = $('#worldDataDetailsWrapper').html();

            if (baseString == '') {
                baseString='None';
            }

            if (uwp.population !== 0) {
                var popstring='';
                for (var i=0; i<uwp.population, i++;) {
                    if (i % 3 == 0) {
                        popstring = ',0'+popstring;
                    }else {
                        popstring = ',0'+popstring;
                    }
                }
                popDesc = '1'+popstring + ' approximate inhabitants';
            } else {
                popDesc='Uninhabited';
            }
            dataHTML = dataHTML.replace('NAME', name)
                .replace('STARPORT', JRPG.Methods.getQueryVariable('starport')+': ' + starportDesc)
                .replace('BASES', baseString)
                .replace('GASGIANT', gasGiants)
                .replace('SIZE', sizeDesc)
                .replace('ATMOS', atmosDesc)
                .replace('HYDRO', hydroDesc)
                .replace('POP', popDesc)
                .replace('GOVT', govtDesc)
                .replace('GOVTDESC', govtDefinition)
                .replace('LAW', law)
                .replace('TECH', JRPG.Methods.getQueryVariable('tech'))
                .replace('TECHDESC', tech)
                .replace('TRADE', JRPG.Methods.getQueryVariable('trade'));
            $('#worldDataDetailsWrapper').html(dataHTML);
        }
    }
};
