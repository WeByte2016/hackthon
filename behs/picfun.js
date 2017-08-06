/* MoMath Math Square Behavior
 *
 *        Title: Picture Fun
 *  Description: 
 * Scheduler ID: 1
 *    Framework: P5
 *       Author: Zhendong Qin
 *      Created: 8/5/2017
 *      Updated: 
 *       Status: 
 */

import P5Behavior from 'p5beh';

//const picfun_server="localhost:80";
const picfun_server="a11c3fa0.ngrok.io";
const pb = new P5Behavior();
var action_done = true;
var resp_ready = false;
var resp_name = "";
var resp_image = 0;
var empty_start_time = 0;
var splash_on = true;
var points = Array();
var xcenter = 576 / 2;

pb.preload = function (p) {
}

pb.setup = function (p) {
  this.fun_images = Array()
  this.fun_images[0] = this.loadImage("images/brick.png");
  this.fun_images[1] = this.loadImage("images/box-goal.png");
};

function add_point(npt) {
	//console.log("npt" + npt);
	for (let pt of points) {
		if(npt[0]==pt[0] && npt[1]==pt[1]) {
			//console.log("pt" + pt);
			return;
		}
	}
	points.push(npt);
	//console.log(points);
}

pb.draw = function (floor, p) {
  if (floor.users.length > 0) {
	  for (let u of floor.users) {
		add_point([Math.floor(u.x * 250.0 / this.width), Math.floor(u.y * 250.0 / this.height)]);
		pb.drawUser(u);
	  }	
  } else {
	  if(resp_ready == true) {
		points = [];
		this.clear();
		this.image(resp_image, 0, 0, this.width, this.height);
		this.textAlign(this.CENTER);
		this.textSize(36);
		this.fill(212, 212, 212);
		this.text(resp_name, xcenter, 500);
	  } else {
		if(splash_on) {
		  this.image(this.fun_images[0],0,0,this.width, this.height);
		  this.strokeWeight(2);
		  this.textSize(96);
		  this.textAlign(this.CENTER);
		  this.textStyle(this.ITALIC);
		  this.fill(152, 212, 152);
		  this.text("Picture", xcenter, 150);
		  this.fill(212, 152, 0);
		  this.text("Fun", xcenter, 250);  
		  this.stroke(180);
		  this.strokeWeight(20);
		  this.line(150, 300, this.width-150, 300);
		}
	  }
  }
};

pb.userUpdate = function (newUsers, deletedUsers, otherUsers, p) {
	if (action_done) {
		if(otherUsers.length > 0) {
			pb.p5.clear();
			pb.p5.textAlign(this.CENTER);
			pb.p5.textSize(24);
			pb.p5.fill(102, 102, 102);
			pb.p5.text("Please draw a face, and I will guess who he/she is.", xcenter, 150);
			splash_on = false;
			action_done = false;
			resp_ready = false;
		}
	} else {
		if(otherUsers.length == 0) {
			var time =  Date.now(); 
			if (empty_start_time == 0){
				empty_start_time =  Date.now();
				//console.log(empty_start_time);
			}
			if (time - empty_start_time > 1000) {
				empty_start_time = 0;
				//console.log(time);
				action_done = true;
			}
		} else {
			empty_start_time = 0;
		}
		
		if (action_done) {
			var data = {"points": points};
			pb.p5.httpPost("http://" + picfun_server + "/picfun/search", "json", data, 
				function(res) {
					resp_name = res["name"];
					resp_image = pb.p5.loadImage("http://" + picfun_server + res["path"]);
					resp_ready = true;
				});
		} else {
			resp_ready = false;
		}
	}
};

export const behavior = {
  title: "Picture Fun",
  frameRate: 'sensors',
  numGhosts: 0,
  init: pb.init.bind(pb),
  render: pb.render.bind(pb),
  userUpdate: pb.userUpdate.bind(pb)
};
export default behavior;

