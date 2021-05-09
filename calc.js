$(document).ready(function() {
  $("#sortable").sortable({
    update: function(event, ui) {
      inputOnChange();
    }
  });
  $("#sortable").disableSelection();
  addCoordinate();
  addCoordinate();
  addCoordinate();
});

function inputOnChange() {
  redrawGraph();
  $("#areaLbl").html(calcArea(getCoords()));
}

function addCoordinate() {
  var cdStr = '<li class="ui-sortable-handle form-group">';
  cdStr += '<span class="form-inline justify-content-center">';
  cdStr += '<div id="num"></div>(';
  cdStr +=
    '<input class="form-control form-control-sm text-right" type="number" style="width: 100px;"/>,';
  cdStr +=
    '<input class="form-control form-control-sm text-right" type="number" style="width: 100px;"/>)';
  cdStr += "</span></li>";
  $("#sortable").append(cdStr);
  $("#sortable")
    .children()
    .last()
    .on("input", function() {
      inputOnChange();
    });
  $("#sortable")
    .children()
    .last()
    .find("input")
    .val(0);
  inputOnChange();
}

function removeLastCoordinate() {
  if ($("#sortable").children().length > 1)
    $("#sortable")
      .children()
      .last()
      .remove();
  inputOnChange();
}

function getCoords() {
  var coords = [[]];
  $("#sortable")
    .children("li")
    .each(function(index, elem) {
      var pnt = [0, 0];
      $(elem)
        .find("input")
        .each(function(index2, elem2) {
          pnt[index2] = $(elem2).val();
          if (pnt[index2].trim() == "") pnt[index2] = 0;
          else pnt[index2] = parseInt(pnt[index2]);
        });
      coords[index] = pnt;
    });
  return coords;
}

function calcArea(coords) {
  if (!isValidArea(coords)) return "Invalid Area";
  var leftSum = 0,
    rightSum = 0;
  for (var i = 0; i < coords.length; i++) {
    var j = (i + 1) % coords.length;
    leftSum += coords[i][1] * coords[j][0];
    rightSum += coords[i][0] * coords[j][1];
  }
  return Math.abs(rightSum - leftSum) / 2;
}

function isValidArea(coords) {
  if (coords.length < 3) return false;
  for (var i = 0; i < coords.length; i++) {
    var j = (i + 1) % coords.length;
    for (var k = i + 2; k < coords.length; k++) {
      var l = (k + 1) % coords.length;
      if (
        j != k &&
        j != l &&
        l != i &&
        doSegmentsIntersect(
          coords[i][0],
          coords[i][1],
          coords[j][0] - coords[i][0],
          coords[j][1] - coords[i][1],
          coords[k][0],
          coords[k][1],
          coords[l][0] - coords[k][0],
          coords[l][1] - coords[k][1]
        )
      )
        return false;
    }
  }
  return true;
}

function doSegmentsIntersect(a, b, c, d, e, f, g, h) {
  var den = h * c - d * g;
  if (den == 0) return false;
  var t1 = (h * (e - a) + g * (b - f)) / den;
  var t2 = (a - e + c * t1) / g;
  var intersects = t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1;
  return intersects;
}

function redrawGraph() {
  var coords = getCoords();
  var gr = $("#graphCanvas")
    .get(0)
    .getContext("2d");
  var viewRect = getRectContainingGraph(coords);
  if (viewRect) {
    drawBackgroundGraph(gr, viewRect);
    drawShape(gr, coords, viewRect);
  }
}

function getCenterOfGraph(coords) {
  var xc = 0.0,
    yc = 0.0;
  for (var i = 0; i < coords.length; i++) {
    xc += coords[i][0];
    yc += coords[i][1];
  }
  xc /= coords.length;
  yc /= coords.length;
  return [xc, yc];
}

function getRectContainingGraph(coords) {
  if (!coords) return null;
  if (coords.length < 3) return null;
  var graphCenter = getCenterOfGraph(coords);
  var diff = 0;
  for (var i = 0; i < coords.length; i++) {
    diff = Math.max(diff, Math.abs(graphCenter[0] - coords[i][0]));
    diff = Math.max(diff, Math.abs(graphCenter[1] - coords[i][1]));
  }
  diff += 20;
  return [graphCenter[0] - diff, graphCenter[1] - diff, diff * 2, diff * 2];
}

function drawShape(gr, coords, viewRect) {
  gr.fillStyle = "blue";
  gr.globalAlpha = 1;
  gr.beginPath();
  for (var i = 0; i < coords.length; i++) {
    var pnt = coords[i];
    var scrPnt = cG2S(pnt, viewRect, [400, 400]);
    if (i == 0) {
      gr.moveTo(scrPnt[0], scrPnt[1]);
    } else {
      gr.lineTo(scrPnt[0], scrPnt[1]);
    }
  }
  gr.closePath();
  gr.stroke();
  gr.globalAlpha = 0.4;
  gr.fill();
}

function drawBackgroundGraph(gr, viewRect) {
  gr.fillStyle = "white";
  gr.beginPath();
  gr.globalAlpha = 1.0;
  gr.fillRect(0, 0, 400, 400);
  gr.font = "10px Arial";

  var inc = Math.ceil(viewRect[2] / 100) * 10;
  for (
    var xx = Math.floor(viewRect[0] / 10) * 10;
    xx <= viewRect[0] + viewRect[2];
    xx += 10
  ) {
    var style = "lightgray";
    if (xx == 0) style = "green";
    else if (xx % inc == 0) style = "gray";
    gr.fillStyle = style;
    gr.strokeStyle = style;
    if (style != "lightgray") {
      var txtPoint = cG2S([xx, viewRect[1] + viewRect[3]], viewRect, [
        400,
        400
      ]);
      gr.fillText(xx + "", txtPoint[0] + 5, txtPoint[1] + 10);
    }
    drawLine(gr, [xx, viewRect[1]], [xx, viewRect[1] + viewRect[3]], viewRect);
  }
  for (
    var yy = Math.floor(viewRect[1] / 10) * 10;
    yy <= viewRect[1] + viewRect[3];
    yy += 10
  ) {
    var style = "lightgray";
    if (yy == 0) style = "red";
    else if (yy % inc == 0) style = "gray";
    gr.fillStyle = style;
    gr.strokeStyle = style;
    if (style != "lightgray") {
      var txtPoint = cG2S([viewRect[0], yy], viewRect, [400, 400]);
      gr.fillText(yy + "", txtPoint[0] + 5, txtPoint[1] + 15);
    }
    drawLine(gr, [viewRect[0], yy], [viewRect[0] + viewRect[2], yy], viewRect);
  }
}

function drawLine(gr, p1, p2, viewRect) {
  var pc1 = cG2S(p1, viewRect, [400, 400]);
  gr.beginPath();
  gr.moveTo(pc1[0], pc1[1]);
  var pc2 = cG2S(p2, viewRect, [400, 400]);
  gr.lineTo(pc2[0], pc2[1]);
  gr.stroke();
}

function cG2S(point, viewRect, scrDim) {
  var retPoint = [0, 0];
  retPoint[0] = ((point[0] - viewRect[0]) / viewRect[2]) * scrDim[0];
  retPoint[1] = (1 - (point[1] - viewRect[1]) / viewRect[3]) * scrDim[1];
  return retPoint;
}
