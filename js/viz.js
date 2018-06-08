/*------------
| GLOBALS    |
-------------*/

var CSV_FILE_LOC = "./data/GOVLAB_transparency_lit_review.csv";

// keep track of current filter values
var CURR_FILTER_VALS   = [];
var CURR_COUNTRY_SEL   = null;
var CURR_REGION_SEL    = null;

// if a partial count of studies is done based on
// just context criteria (region/country, principal, agent)
// keep track of it here
var PARTIAL_STUDY_COUNT = null;

// keep track of additional countries to filter
var ADDTNL_COUNTRY = [];

// keep track of available data
var AVLBL_COUNTRY = [];
var AVLBL_REGION  = [];


// names for UI elements
var COLS = [
    "know_monitor",
    "know_sanction",
    "effort_to_monitor",
    "effort_to_sanction",
    "provider_effort",
    "provider_corruption",
    "outputs",
    "outcomes"
];

var ROWS = [
    "aa_avenues_of_redress",
    "providers_duties", 
    "aa_duties", 
    "provider_inputs",
    "provider_effortcorr", 
    "provider_outputs"
    // , "provider_outcomes"
];

var ROW_NAMES = [
    "Redress mechanisms",
    "Government duties and obligations",
    "Civic duties and responsibilties",
    "Government resources",
    "Government effort",
    "Government services"
];

var COL_NAMES =[
    "Knowledge of how to government",
    "Knowledge of how to government",
    "Monitoring of government",
    "Sanctioning of government",
    "Government effort",
    "Government corruption",
    "Government services",
    "Development outcomes"
];


var FILTERS = [
    "delivery_mode",
    "sector",
    "methodology",
    "government_level",
    "setting",
    "principal",
    "agent"
];

var FILTER_NAMES = [
    "delivery mode",
    "sector",
    "methodology",
    "government level",
    "setting",
    "principal",
    "agent"
];

var FILTER_VALUES = [
    [
        "Any",
        "Trainings",
        "Media campaign",
        "Pamphlets or letters",
        "FOIA",
        "Other",
    ],
    [
        "Any",
        "Education",
        "Entitlements",
        "Health",
        "Other"
    ],
    [
        "Any",
        "Experimental",
        "SOO",
        "FE",
        "DiD",
        "RDD",
        "IV",
        "Correlational",
        "Qualitative"
    ],
    [
        "Any",
        "National",
        "Intermediate",
        "Local"
    ],
    [
        "Any",
        "Urban",
        "Rural",
        "Peri-urban"
    ],
    [
        "Any",
        "Citizens",
        "Politicians",
        "Bureaucrats/Judicial body",
        // "Bureaucrats/Judicial body",
        "Other"
    ],
    [
        "Any",
        "Citizens",
        "Politicians",
        "Bureaucrats/Judicial body",
        // "Bureaucrats/Judicial body",
        "Other"
    ]
]

SIMILIARITY_METRIC_CONTEXT_FACTORS = [
    "Level of economic development",
    "Strength of rule of law",
    "Regime type",
    "Degree of corruption/clientelism",
    "Degree of procedural democracy",
    "Degree of civic space and protection for civil freedoms",
    "Strength of civil society sector and social movements",
    "Professionalization of bureaucracy/bureaucratic capacity",
    "Social capital",
    "Horizontal accountability institutions"
]

/*-----------
| "MAIN"    |
------------*/

$(document).ready(function() {

    // Initialize UI elements
    initButtons();
    initFilters();
    initTable();
    initToolTips();

    // Listen for user updates to UI elements
    onRegionInputUpdates();
    onCountryInputUpdates();
    onPrincipalAndAgentUpdates();
    onSimilarCountrySlidersUpdates();

});

/*----------
| INIT FXNS |
-----------*/

function initFilters() {

    d3.csv(CSV_FILE_LOC, function(data) {

        // AVLBL_REGION = data.map(function(d){ return d.region; })
        //                    .reduce(function(p, v){ return p.indexOf(v) == -1 ? p.concat(v) : p; }, [])
        //                     .filter(function(d){ return (d !== "NA"); });

        AVLBL_COUNTRY = data.map(function(d){ return d.country; })
                            .reduce(function(p, v){ return p.indexOf(v) == -1 ? p.concat(v) : p; }, [])
                            .filter(function(d){ return (d !== "NA"); });


        // dynamic filters
        d3.select("#region").selectAll("option")
            .data(data.map(function(d){ return d.region; })
                                .reduce(function(p, v){ return p.indexOf(v) == -1 ? p.concat(v) : p; }, [])
                                .filter(function(d){ return (d !== "NA"); })
                        )
            .enter()
            .append("option")
            .text(function(d){return d;})
            .attr("value",function(d){return d;});
            
        d3.select("#country").selectAll("option")
            .data(ALL_COUNTRIES.map(function(x){ return x; })
                               .filter(function(d){ return (d !== "NA"); })
                        )      .enter()
            .append("option")
            .text(function(d){return d;})
            .attr("value",function(d){return d;});

    });
}

function initTable(){
    d3.select("body").selectAll("svg").remove();


    d3.csv(CSV_FILE_LOC, function(data){
        init_data = formatCsvData( data );

        var svgs = d3.select("body")
            .selectAll("td")
            .append("svg")
            .attr("width", "90%")
            .attr("height", "40%")

        var tip = d3.tip()
                    .attr("class", "d3-tip")
                    .offset([-8, -55])
                    // .html(function(d) { return "<b>"+d.N+"</b>"+ " studies<br>"; });
                    .html(function(d) { 

                        var uniq_studies = d.studies;
                        N = uniq_studies.length;

                        if (N == 1) {
                            var html = "<h5><b>"+N+"</b>"+ " study<br></h5>";
                        } else {
                            var html = "<h5><b>"+N+"</b>"+ " studies<br></h5>";
                        }

                        for (var i=0; i < uniq_studies.length; i++) {
                            html += '<b>"'+uniq_studies[i].studyname+'" </b><br>';
                            html += uniq_studies[i].authors + " (" + uniq_studies[i].year + ")<br><br>";
                        }

                        return html;
                    });

        svgs.call(tip);

        svgs.data(init_data)
            .append("circle")
            .attr("class", "summaryCircle")
            .attr("r", function(d){ 
                return d.N == 0 ? 0 : d.N+5;
            })
            .on('mouseover', function(d){
                tip.show(d);
                d3.select(this)
                   .transition()
                   .style("cursor", "pointer")
                   .attr("fill", "red");
            })
            .on('mouseout', function(d){
                tip.hide(d);
                d3.select(this)
                   .transition()
                   .style("cursor", "default")
                   .attr("fill", "Black");
            })
            .on("click", function(d, i){
                generatePDF(d, CURR_FILTER_VALS, i);
            })
            .transition()
            .attr("r", function(d){
                if (d.N == 0) {
                    return 0;
                }
                return d.N+5;
            })
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("fill", "Black")
            .attr("id", function(d){
                return d.id;
            })
        
        var N = 0;
        var uniq_studies = [];
        for (s = 0; s < data.length; s++) {
            if (uniq_studies.indexOf(data[s].studyname) == -1){
                uniq_studies.push(data[s].studyname);
            }
        }

        N = uniq_studies.length;
        // console.log(uniq_studies);

        if (N == 1) {
            d3.select("#numStudies").html("<h4><b>" + N + "</b> total study (click on a circle to download a report of the papers and summaries):</h4>");  
        } else {
            d3.select("#numStudies").html("<h4><b>" + N + "</b> total studies (click on a circle to download a report of the papers and summaries):</h4>");  
        }
    });

    return true;
}


function initButtons() {
    $(".alert").hide();
    $('#showFormBtn').click(function() {
        if (document.getElementById("showFormBtn").innerHTML == "Show query menu"){
            $("#showFormBtn").text('Hide query menu');
        } else {
            $("#showFormBtn").text('Show query menu');
        }
        
    });

}

function initToolTips(){
    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });
}


/*------------
| LISTENERS  |
------------*/


function onRegionInputUpdates() {

    $("#region").on("change", function() {

        selected_country   = document.getElementById("country").value;
        // >>>>>>>>>>
        // selected_region    = document.getElementById("region").value;
        // ==========
        selected_region = null;
        // <<<<<<<<<<
        selected_principal = document.getElementById("principal").value;
        selected_agent     = document.getElementById("agent").value;

        if (selected_country != "Any") {
            document.getElementById("country").value = "Any";
            selected_country = "Any";
        }

        if ((selected_principal == "Bureaucrats") | (selected_principal == "Judicial body")) {
            selected_principal = "Bureaucrats/Judicial body";
        }

        if ((selected_agent == "Bureaucrats") | (selected_agent == "Judicial body")) {
            selected_agent = "Bureaucrats/Judicial body";
        }

        updatePartialFilterNumStudiesDisplay(selected_region, selected_country, selected_principal, selected_agent);

        updateSimilaritySliderOuterDisplay(selected_region, selected_country, selected_principal, selected_agent);

    })

}

function onCountryInputUpdates() {
    // things to do when the user 
    // selects a new country

    $("#country").on("change", function() {

        selected_country   = document.getElementById("country").value;
        // >>>>>>>>>>
        // selected_region    = document.getElementById("region").value;
        // ==========
        selected_region = null;
        // <<<<<<<<<<        
        selected_principal = document.getElementById("principal").value;
        selected_agent     = document.getElementById("agent").value;

        // if (selected_country != "Any") {
        //     document.getElementById("region").value = "Any";
        //     selected_region = "Any";
        // }

        updatePartialFilterNumStudiesDisplay(selected_region, selected_country, selected_principal, selected_agent);

        updateSimilaritySliderOuterDisplay(selected_region, selected_country, selected_principal, selected_agent);


    })
}


function onPrincipalAndAgentUpdates() {

    $("#principal").on("change", function() {

        selected_country   = document.getElementById("country").value;
        // >>>>>>>>>>
        // selected_region    = document.getElementById("region").value;
        // ==========
        selected_region = null;
        // <<<<<<<<<<
        selected_principal = document.getElementById("principal").value;
        selected_agent     = document.getElementById("agent").value;

        if ((selected_principal == "Bureaucrats") | (selected_principal == "Judicial body")) {
            selected_principal = "Bureaucrats/Judicial body";
        }

        if ((selected_agent == "Bureaucrats") | (selected_agent == "Judicial body")) {
            selected_agent = "Bureaucrats/Judicial body";
        }
        
        updatePartialFilterNumStudiesDisplay(selected_region, selected_country, selected_principal, selected_agent);

        updateSimilaritySliderOuterDisplay(selected_region, selected_country, selected_principal, selected_agent);

    });

    $("#agent").on("change", function() {
        selected_country   = document.getElementById("country").value;
        // >>>>>>>>>>
        // selected_region    = document.getElementById("region").value;
        // ==========
        selected_region = null;
        // <<<<<<<<<<
        selected_principal = document.getElementById("principal").value;
        selected_agent     = document.getElementById("agent").value;

        if ((selected_principal == "Bureaucrats") | (selected_principal == "Judicial body")) {
            selected_principal = "Bureaucrats/Judicial body";
        }

        if ((selected_agent == "Bureaucrats") | (selected_agent == "Judicial body")) {
            selected_agent = "Bureaucrats/Judicial body";
        }

        updatePartialFilterNumStudiesDisplay(selected_region, selected_country, selected_principal, selected_agent);

        updateSimilaritySliderOuterDisplay(selected_region, selected_country, selected_principal, selected_agent);

    });

}


function onSimilarCountrySlidersUpdates() {

    $("#similaritySlider").on("mousemove", function() {
        n = parseInt($("#similaritySlider").val(), 10);
        selected_country   = document.getElementById("country").value;
        selected_principal = document.getElementById("principal").value;
        selected_agent     = document.getElementById("agent").value;

        if ((selected_principal == "Bureaucrats") | (selected_principal == "Judicial body")) {
            selected_principal = "Bureaucrats/Judicial body";
        }

        if ((selected_agent == "Bureaucrats") | (selected_agent == "Judicial body")) {
            selected_agent = "Bureaucrats/Judicial body";
        }

        updateSimilaritySlider(n, selected_country, selected_principal, selected_agent);
    });

}

/*-------------------
| UPDATE/ACTION FXNS |
--------------------*/

function clearContextFilters() {

    document.getElementById("country").value   = "Any";
    document.getElementById("principal").value = "Any";
    document.getElementById("agent").value     = "Any";
    updatePartialFilterNumStudiesDisplay("Any", "Any", "Any", "Any");
    updateSimilaritySliderOuterDisplay("Any", "Any", "Any", "Any");

}

function clearAll() {

    document.getElementById("country").value   = "Any";
    document.getElementById("principal").value = "Any";
    document.getElementById("agent").value     = "Any";
    updatePartialFilterNumStudiesDisplay("Any", "Any", "Any", "Any");
    updateSimilaritySliderOuterDisplay("Any", "Any", "Any", "Any");

    $('input[type=checkbox]').prop('checked', false);
    $('input[id=default_check]').prop('checked', true);

}


function updatePartialFilterNumStudiesDisplay(region, country, principal, agent) {
    // update the block of text that shows the number of studies
    // available based on partial query (region/country/principal/agent)

    principal_vidxs = FILTER_VALUES[5].map((e, i) => e === principal ? i : '').filter(String);
    agent_vidxs = FILTER_VALUES[6].map((e, i) => e === agent ? i : '').filter(String);

    d3.csv(CSV_FILE_LOC, function(data) {

        var relevant_studies = data.filter(function(d) {

            if (
                    (
                        d["country"] == country 
                        // || d["region"] == region
                    ) 
                    & 
                    ( // study matches users' desired principal
                        principal_vidxs.indexOf(parseInt(d["principal"], 10)) != -1 || principal == "Any" 
                    ) 
                    & 
                    ( // study matches users' desired agent
                        agent_vidxs.indexOf(parseInt(d["agent"], 10)) != -1 || agent == "Any" 
                    )
            ) {
                return true;
            }

        })

        PARTIAL_STUDY_COUNT = relevant_studies.length;

        if ( 
                country == "Any" 
                // && region == "Any" 
            ) {
            // 'any' is selected in both region and country fields
            document.getElementById("totalStudiesText").innerHTML = "";
        }

        if (PARTIAL_STUDY_COUNT == 0) {

            // if ( 
            //         country == "Any" 
            //         // && region != "Any" 
            //     ) {
            //     // user is selecting a region without any studies

            //     document.getElementById("totalStudiesText").innerHTML = "<b>"+PARTIAL_STUDY_COUNT+"<i></b> total studies found for selected regional context. Please specify a different context.</i>";
            //     document.getElementById("similaritySliderTitle").innerHTML = "Select other contextually comparable countries of study:";

            // } 
            if ( country != "Any" ) {
                // user is selecting a country without any studies

               document.getElementById("totalStudiesText").innerHTML = "<b>"+PARTIAL_STUDY_COUNT+"<i></b> total studies found for selected context. Please specify a different context or a search range for similar countries to your selected country (with available studies) below.</i>";
                document.getElementById("similaritySliderTitle").innerHTML = "Expand your search to studies from comparable country contexts:";

                //// have the similarity slider, by default, be set to 1
                document.getElementById("similaritySlider").value = 1;
                updateSimilaritySlider(1, country, principal, agent);

            }

        } else {
            if ( country != "Any" ) {
                document.getElementById("totalStudiesText").innerHTML = "<i><b>"+PARTIAL_STUDY_COUNT+"</b> total studies found for selected context.</i>";
            } 
            // if ( region != "Any" ) {
            //     document.getElementById("totalStudiesText").innerHTML = "<i><b>"+PARTIAL_STUDY_COUNT+"</b> total studies found for selected regional context.</i>";   
            // }

            document.getElementById("similaritySliderTitle").innerHTML = "Expand your search to studies from comparable country contexts (optional):";
        }

        $("#totalStudiesDiv").show();


    });

}

function updateSimilaritySliderOuterDisplay(region, country, principal, agent) {
    // update all the html around the similarity slider based on user inputs

    if (country != "Any") {
        //// user is selecting a specific country
        $("#similarityContent").show();
        $("#similarityContentPlaceHolder").hide();

        if ((principal == "Any" && agent == "Any") || (principal == "Any" && agent == "Other") || (principal == "Other" && agent == "Any") || (principal == "Other" && agent == "Other")) {
            document.getElementById("sliderStatement").innerHTML = "most contextually comparable countries (with available studies) to <code>"+selected_country+"</code> overall";
        }

        else if (principal == agent || principal == "Any" || agent == "Any" || principal == "Other" || agent == "Other" ) {
            //// use only a single distance metric
            single_actor = (principal == "Any" || principal == "Other") ? agent : principal;
            document.getElementById("sliderStatement").innerHTML = "most contextually comparable countries (with available studies) to <code>"+selected_country+"</code> regarding the behavior of <code>"+single_actor+"</code>";
        } else {
            document.getElementById("sliderStatement").innerHTML = "most contextually comparable countries (with available studies) to <code>"+selected_country+"</code> regarding the behavior of <code>"+principal+"</code> and <code>"+agent+"</code>";
        }

        //// update tooltip
        updateSimilaritySliderFootnote(country, principal, agent);

    } else {
        //// user is selecting a specific region
        $("#similarityContent").hide();
        $("#similarityContentPlaceHolder").show();
    }
}

function updateSimilaritySlider(n, country, principal, agent) {
    // update the actual slider apparatus itself which includes
    // the slider counter text and the block of countries below it.

    $("#sliderNum").text(n);
    ADDTNL_COUNTRY = getCountriesSimiliarTo(country, principal, agent).slice(1, n+1);
    document.getElementById("similarCountries").innerHTML = ADDTNL_COUNTRY.join(", ");

}

function updateSimilaritySliderFootnote(country, principal, agent) {

    htmlText = "Based on your selection of <code>"+principal+"</code> as principal and <code>"+agent+"</code> as agent, countries comparable to <code>"+country+"</code>are identified using the following contextual factors:<br><br>";

    if ((principal == "Citizens" && agent == "Bureaucrats/Judicial body" ) || (agent == "Citizens" && principal == "Bureaucrats/Judicial body" )) {
        f_idxs = [1,2,3,4,6,7,8,9,10];
    } else if ((principal == "Citizens" && agent == "Politicians" ) || (agent == "Citizens" && principal == "Politicians" )) {
        f_idxs = [1,2,3,4,5,6,7,8,9];
    } else if ((principal == "Bureaucrats/Judicial body" && agent == "Politicians" ) || (agent == "Bureaucrats/Judicial body" && principal == "Politicians" )) {
        f_idxs = [1,2,3,4,5,6,7,8,10];
    } else if (principal == "Citizen" || agent == "Citizen") {
        f_idxs = [1,2,3,4,6,7,8,9];
    } else if (principal == "Bureaucrats/Judicial body" || agent == "Bureaucrats/Judicial body") {
        f_idxs = [1,2,3,4,8,10];
    } else if (principal == "Politicians" || agent == "Politicians") {
        f_idxs = [1,2,3,4,5,6,7];
    } else {
        f_idxs = [1,2,3,4];
    }

    htmlText += "<ol>";

    for (i=0; i < f_idxs.length; i++) {
        htmlText += "<li>";
        htmlText += SIMILIARITY_METRIC_CONTEXT_FACTORS[f_idxs[i]-1];
        htmlText += "</li>";
    }
    htmlText += "</ol>";
    document.getElementById("similaritySliderFootnoteText").innerHTML = htmlText;

}

function getCountriesSimiliarTo(country, principal, agent) {
    // pick the correct dictionary object to use according to the two
    // distance metrics passed in and return all the countries for 
    // the specific `base_country`

    if ((principal == "Citizens" && agent == "Bureaucrats/Judicial body" ) || (agent == "Citizens" && principal == "Bureaucrats/Judicial body" )) {
        d_ = D_CIT_BUR;
    } else if ((principal == "Citizens" && agent == "Politicians" ) || (agent == "Citizens" && principal == "Politicians" )) {
        d_ = D_CIT_POL;
    } else if ((principal == "Bureaucrats/Judicial body" && agent == "Politicians" ) || (agent == "Bureaucrats/Judicial body" && principal == "Politicians" )) {
        d_ = D_POL_BUR;
    } else if (principal == "Citizen" || agent == "Citizen") {
        d_ = D_CIT;
    } else if (principal == "Bureaucrats/Judicial body" || agent == "Bureaucrats/Judicial body") {
        d_ = D_BUR;
    } else if (principal == "Politicians" || agent == "Politicians") {
        d_ = D_POL;
    } else {
        d_ = D_ALL;
    }

    sim_c = d_[country].filter(function(d) { return AVLBL_COUNTRY.indexOf(d) != -1; } );
    return sim_c;

}



function collectUserFilters() {
    // collect user inputs
    var filter_vals = [];
    for (var i=0; i < FILTERS.length; i++){
        if (i == 5 || i == 6) {
            //// principal/agent is selected using a dropdown
            //// so slightly different collection process
            var filter = FILTERS[i];
            var value = document.getElementById(filter).value;

            if ((value == "Bureaucrats") | (value == "Judicial body")) {
                value = "Bureaucrats/Judicial body";
            }

            filter_vals.push([FILTER_VALUES[i].indexOf(value)]);
        

        } else {

            var filter = FILTERS[i];
            var inputs = document.querySelectorAll( '[name="'+filter+'"]' );
            var input_vals = [];
            for (var j=0; j < inputs.length; j ++){
                if (inputs[j].checked){
                    input_vals.push(parseInt(inputs[j].value));
                }
            }
            filter_vals.push(input_vals);
        }
    }
    return filter_vals;
}

function filterCsvData(data) {

    // collect user inputs

    //// FILTERS
    CURR_FILTER_VALS = collectUserFilters();

    //// collect main geographic area
    CURR_COUNTRY_SEL = document.getElementById("country").value;
    // CURR_REGION_SEL = document.getElementById("region").value;

    if (CURR_COUNTRY_SEL != "Any") {
        var loc_filter = "country";
        var loc_value = CURR_COUNTRY_SEL;
    }
    // else if (CURR_REGION_SEL != "Any") {
    //     var loc_filter = "region";
    //     var loc_value = CURR_REGION_SEL;
    // }

    // apply user inputs
    var flt_data = data.filter(function(d) {

        for (var i=0; i < FILTERS.length; i++){
            var filter = FILTERS[i];
            var d_vals = d[filter].split(";");

            if (CURR_FILTER_VALS[i].indexOf(0) != -1) {
                // if user selected the '0' option ('All'), then
                // include this row.
                continue;
            }

            var any_vals = false;
            for (var j=0, len=d_vals.length; j<len; j++){
                var d_val = parseInt(d_vals[j], 10);

                if (CURR_FILTER_VALS[i].indexOf(d_val) != -1) {
                    // check if the user specified any 
                    // value present for this category
                    any_vals = true;
                }    
            }

            if (any_vals == false) {
                return false;
            }

        }

        if (
            !(
                CURR_COUNTRY_SEL == "Any" 
            // &&  CURR_REGION_SEL == "Any" 
            )) { 

            if ( !(CURR_COUNTRY_SEL == "Any") && (ADDTNL_COUNTRY.length != 0 )) {
                // return this country if it's in our list of 
                // similar countries
                if ( ADDTNL_COUNTRY.indexOf(d[loc_filter]) != -1 ) {
                    return true;
                }
            }

            if ( d[loc_filter] != loc_value ) {
                return false;
            }

        }

        return true;

    })
    
    return flt_data;
}

function formatCsvData(data) {
        // [ { pos: i, studies : [ {}, {}, {}, {} ], N : x } ... ]
        fmt_data = [];
        p = 0;
        for (var r=0; r < ROWS.length; r++ ){
            for (var c=0; c < COLS.length; c++){
                var cell = { "pos" : p, "studies" : [], "N" : 0, "row" : ROWS[r], "col" : COLS[c] };
                var cell_uniq_studynames = [];
                for (var d=0; d < data.length; d++ ){
                    if (data[d][ROWS[r]] >= 1 && data[d][COLS[c]] >= 1){
                        if (cell_uniq_studynames.indexOf(data[d].studyname) == -1){
                            cell.studies.push(data[d]);
                            cell.N += 1;
                            cell_uniq_studynames.push(data[d].studyname);
                        }
                    }
                }
                p++;
                fmt_data.push(cell);
            }
        }
        return fmt_data;
}


function updateTable() {
    // function to call upon submitting
    // the query form

    // check for errors
    var error_text = "";

    //// incomplete filters
    var filter_vals = collectUserFilters();
    for (var i=0; i < FILTERS.length; i++){
        if (filter_vals[i].length == 0) {
            error_text += "- Please select an appropriate filter for <strong>"+FILTER_NAMES[i]+"</strong>.<br>";
        }
    }
    CURR_COUNTRY_SEL = document.getElementById("country").value;
    // CURR_REGION_SEL = document.getElementById("region").value;

    if ( ADDTNL_COUNTRY.length == 0 && AVLBL_COUNTRY.indexOf(CURR_COUNTRY_SEL) == -1 && CURR_COUNTRY_SEL != "Any" ) {
        error_text += "- Context is missing information. Please select at least one <strong>country</strong> with available studies or a specific <strong>region</strong>.<br>";
    } else if ( PARTIAL_STUDY_COUNT != null && PARTIAL_STUDY_COUNT == 0 && ADDTNL_COUNTRY.length == 0 ) {
        //// no studies found based on partial filters
        error_text += "- No studies can be found for context. Please specify a different context.<br>"
    }


    if (error_text.length > 0) {
        d3.select("#errorText").html(error_text);
        $('.alert').hide().show();
        return false;
    }

    d3.select("#errorText").html("");
    $('.alert').hide();


    d3.csv(CSV_FILE_LOC, function(data){
        flt_data = filterCsvData(data);
        new_data = formatCsvData(flt_data);

        d3.select("body")
            .selectAll("circle")
            .data(new_data)
            .transition()
            .attr("r", function(d){
                return d.N == 0 ? 0 : d.N+5;
            });

        var N = 0;
        var uniq_studies = [];
        for (s = 0; s < flt_data.length; s++) {
            if (uniq_studies.indexOf(flt_data[s].studyname) == -1){
                uniq_studies.push(flt_data[s].studyname);
            }
        }

        N = uniq_studies.length;

        if (N == 1) {
            d3.select("#numStudies").html("<h4><b>" + N + "</b> total study for query (<b>click</b> on a circle to download PDF summary of corresponding studies):</h4>");  
        } else {
            d3.select("#numStudies").html("<h4><b>" + N + "</b> total studies for query (<b>click</b> on a circle to download PDF summary of corresponding studies):</h4>");  
        }
        
        // console.log(uniq_studies);

    });
    
    return false;
}

function generatePDF(data, filters, bubbleIdx) {
    // generate PDF upon click of a specific cell in the table
    const pdf = new jsPDF(); 
    pdf.setProperties({
        title: 'PDF Title',
        subject: 'Info about PDF',
        author: 'PDFAuthor',
        keywords: 'generated, javascript, web 2.0, ajax',
        creator: 'My Company'
    });

    pdf.setFont("helvetica");
    pdf.setFontType("bold");
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(15);
    pdf.text(15, 20, "MIT GOV/LAB Accountability Literature Review");

    pdf.setFont("helvetica");
    pdf.setFontType("normal");
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text(15, 25, "This document compiles all relevant literature published in the last 10 years addressing the\n effects of information on government accountability within a user-specified context. To find \n evidence for different contexts, visit our interactive web tool at the following URL:");

    pdf.setFont("helvetica");
    pdf.setFontType("normal");
    pdf.setTextColor(40, 82, 190);
    pdf.setFontSize(10);
    pdf.text(15, 37, "http://www.mitgovlab.org/evidence-gap-map");

    pdf.setLineWidth(0.5);
    pdf.line(15, 41, 180, 43);

    pdf.setFont("helvetica");
    pdf.setFontType("bold");
    pdf.setTextColor(0,0,0);
    pdf.setFontSize(14);

    var yOffset = 10;

    pdf.setFont("helvetica");
    pdf.setFontType("bold");
    pdf.text(15, 49, "Description of studies queried");
    pdf.setFontSize(12);

    if (CURR_FILTER_VALS.length > 0) {

        allAny = true;

        // if (CURR_REGION_SEL != null & CURR_REGION_SEL != "Any") {
        //     pdf.setFont("helvetica");
        //     pdf.setFontType("bold");
        //     pdf.text(20, 45+yOffset, "region? ");
        //     pdf.setFontType("italic");
        //     pdf.text(80, 45+yOffset, CURR_REGION_SEL)
        //     yOffset += 5;
        //     allAny = false;
        // }

        if (CURR_COUNTRY_SEL != null & CURR_COUNTRY_SEL != "Any") {
            pdf.setFont("helvetica");
            pdf.setFontType("bold");
            pdf.text(20, 45+yOffset, "country? ");
            pdf.setFontType("italic");
            pdf.text(80, 45+yOffset, CURR_COUNTRY_SEL);
            allAny = false;
            yOffset += 5;
        }

        for (i=0; i < CURR_FILTER_VALS.length; i++) {

            if (CURR_FILTER_VALS[i].indexOf(0) == -1){

                allAny = false;

                pdf.setFont("helvetica");
                pdf.setFontType("bold");
                pdf.text(20, 45+yOffset, FILTER_NAMES[i]+"? ");

                filterText = "";
                for (j=0; j < CURR_FILTER_VALS[i].length; j++) {
                    filterText += FILTER_VALUES[i][j+1];
                    if (j != CURR_FILTER_VALS[i].length-1) {
                        filterText += ", ";
                    }
                }
                pdf.setFontType("italic");
                pdf.text(80, 45+yOffset, filterText)

                yOffset += 5;
            }
        }

        if (allAny) {
            pdf.setFontType("normal");
            pdf.text(20, 45+yOffset, "(all)")
            yOffset += 5;
        }

    }

    pdf.setFontType("bold");
    pdf.text(20, 45+yOffset, "information provided: ");
    pdf.setFontType("italic");
    pdf.text(80, 45+yOffset, ROW_NAMES[ROWS.indexOf(data["row"])]);
    yOffset += 5;

    pdf.setFontType("bold");
    pdf.text(20, 45+yOffset, "outcomes measured: ");
    pdf.setFontType("italic");
    pdf.text(80, 45+yOffset, COL_NAMES[COLS.indexOf(data["col"])]);
    yOffset += 5;

    var uniq_studies = data.studies;
    N = uniq_studies.length;

    if (N == 1) {
        var study_num = N+" relevant study";
    } else {
        var study_num = N+" relevant studies";
    }

    pdf.setFontType("bold");
    pdf.setFontSize(14);
    pdf.text(15, 50+yOffset, study_num);
    pdf.setFontSize(9);
    pdf.setFontType("normal");
    pdf.text(15, 55+yOffset, "(click on URL to open hyperlink)");

    var ypos = 45+yOffset+14;
    var studytext = "";
    pdf.setFont("helvetica");
    pdf.setFontSize(11);
    pdf.page = 1;
    pdf.setLineWidth(0.5);
    pdf.line(15, 275, 180, 275);
    pdf.text(180, 285, "page "+pdf.page);


    var studytext = "";
    for (var i=0; i < uniq_studies.length; i++) {
        console.log(uniq_studies);
        studytext += "\nTitle:  ";
        studytext += uniq_studies[i].studyname;
        studytext += "\nAuthors:  ";
        studytext += uniq_studies[i].authors 
        studytext += "\nYear:  " 
        studytext += uniq_studies[i].year;
        studytext += "\nAbstract:  " + uniq_studies[i].abstract;
        studytext += "\nURL:  " + uniq_studies[i].URL;

        studytext += "\n\n\n";
        pdf.setFontSize(11);

        if (i == uniq_studies.length-1){
            pdf.text(15, ypos, pdf.splitTextToSize(studytext, 150));
        }

        if (i % 2 == 1 & i != uniq_studies.length-1) {
            pdf.text(15, ypos, pdf.splitTextToSize(studytext, 150));
            pdf.addPage();
            pdf.page++;
            // header
            pdf.setFontType("bold");
            pdf.text(15, 20, "MIT GOV/LAB Accountability Literature Review");
            pdf.setLineWidth(0.5);
            pdf.line(15, 25, 180, 25);
            // footer
            pdf.setLineWidth(0.3);
            pdf.line(15, 275, 180, 275);
            pdf.setFontSize(9);
            pdf.setFontType("normal");
            pdf.text(180, 285, "page "+pdf.page);
    
            studytext = "";
            var ypos = 38;
        }

    }


    pdf.save();
}



