scriptId = 'com.nerfjs.myo'
scriptTitle = "Nerf.js"
scriptDetailsUrl = ""

function onForegroundWindowChange(app, title)
        myo.debug("onForegroundWindowChange: " .. app .. ", " .. title)
        return true
    end


function onPoseEdge(pose, edge)
        myo.debug("onPoseEdge: " .. pose .. ": " .. edge)
    end`