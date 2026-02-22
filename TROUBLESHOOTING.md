# 🔧 RAKSH - Troubleshooting Guide

## Common Issues & Solutions

---

## 🚨 Critical Issues

### Issue: Application Won't Load / Blank Screen

**Symptoms:**
- White/blank screen
- Nothing appears
- Console shows errors

**Solutions:**

1. **Check Browser Console**
   ```
   Press F12 → Console tab
   Look for red error messages
   ```

2. **Clear Browser Cache**
   ```
   Ctrl+Shift+Delete (Windows)
   Cmd+Shift+Delete (Mac)
   Clear cached images and files
   ```

3. **Hard Refresh**
   ```
   Ctrl+Shift+R (Windows)
   Cmd+Shift+R (Mac)
   ```

4. **Try Different Browser**
   - Chrome (recommended)
   - Firefox
   - Edge
   - Safari

---

## 🔐 Authentication Issues

### Issue: Can't Sign Up

**Error: "Signup failed" or "Invalid email"**

**Solutions:**

1. **Check Email Format**
   ```
   ✅ Good: user@example.com
   ❌ Bad: user@example
   ❌ Bad: user.example.com
   ```

2. **Password Requirements**
   ```
   Minimum 6 characters
   Example: test123, demo2024
   ```

3. **Email Already Used**
   ```
   Try a different email address
   Or login if you already have an account
   ```

4. **Network Issues**
   ```
   Check internet connection
   Wait 30 seconds and try again
   ```

---

### Issue: Can't Login

**Error: "Login failed" or "Invalid credentials"**

**Solutions:**

1. **Verify Credentials**
   ```
   Email: Exactly as entered during signup
   Password: Case-sensitive
   ```

2. **Account Doesn't Exist**
   ```
   Solution: Click "Sign up" to create account first
   ```

3. **Clear localStorage**
   ```javascript
   Open Console (F12)
   Type: localStorage.clear()
   Press Enter
   Try login again
   ```

4. **Create New Account**
   ```
   Use a different email
   Example: yourname2@test.com
   ```

---

### Issue: Redirected to Wrong Dashboard

**Symptoms:** Logged in but see wrong role's dashboard

**Solutions:**

1. **Check Your Role**
   ```javascript
   Open Console (F12)
   Type: localStorage.getItem('user')
   Check the "role" field
   ```

2. **Logout and Login Again**
   ```
   Click Logout button
   Login with correct credentials
   ```

3. **Create Account with Correct Role**
   ```
   During signup, select the right role:
   - Ambulance Driver
   - Hospital Staff
   - Traffic Police
   ```

---

## 🗺️ Map Issues

### Issue: Map Not Loading

**Symptoms:**
- Gray box where map should be
- No map tiles
- "Loading..." indefinitely

**Solutions:**

1. **Check Internet Connection**
   ```
   Map tiles load from OpenStreetMap
   Requires active internet
   ```

2. **Wait 10 Seconds**
   ```
   Map tiles may take time to load
   Be patient on slow connections
   ```

3. **Refresh Page**
   ```
   F5 or Ctrl+R
   Wait for full page reload
   ```

4. **Check Console for Errors**
   ```
   F12 → Console
   Look for errors related to "leaflet" or "map"
   ```

---

### Issue: Markers Not Showing

**Symptoms:**
- Map loads but no markers/icons
- Can't see ambulance/hospital/accident markers

**Solutions:**

1. **Create an Incident First**
   ```
   Ambulance dashboard: Fill form and submit
   Markers appear after incident creation
   ```

2. **Wait for Auto-Refresh**
   ```
   Hospital/Traffic dashboards refresh every 5 seconds
   Wait up to 5 seconds for markers to appear
   ```

3. **Zoom Out**
   ```
   Use mouse scroll or +/- buttons
   Markers might be outside current view
   ```

4. **Check if Incidents Exist**
   ```
   If no active incidents, no markers will show
   Create a test incident from ambulance dashboard
   ```

---

### Issue: Route Not Displaying

**Symptoms:**
- Markers show but no line connecting them
- Route line missing

**Solutions:**

1. **Ensure Hospital is Selected**
   ```
   Ambulance: Must select destination hospital
   Route only shows after hospital selection
   ```

2. **Wait After Incident Creation**
   ```
   Route appears after emergency submission
   May take 2-3 seconds to render
   ```

3. **Check Both Locations Exist**
   ```
   Need both:
   - Current location (ambulance)
   - Destination (hospital)
   ```

---

## 📍 Location Issues

### Issue: Location Not Detected

**Error: "Unable to determine location"**

**Solutions:**

1. **Allow Browser Location Permission**
   ```
   Chrome: Click lock icon in address bar
   → Site Settings → Location → Allow
   
   Firefox: Click lock icon
   → Clear permissions → Reload → Allow when prompted
   ```

2. **Check Browser Settings**
   ```
   Chrome: Settings → Privacy → Site Settings → Location
   Enable "Sites can ask for location"
   ```

3. **Use HTTPS**
   ```
   Geolocation only works on HTTPS sites
   (Figma Make uses HTTPS by default)
   ```

4. **Fallback Coordinates Work Fine**
   ```
   System automatically uses Bangalore coordinates
   Demo works perfectly for presentation
   ```

5. **Device GPS Off**
   ```
   Desktop: May not have GPS
   Laptop: Check if GPS enabled
   Mobile: Turn on Location Services
   ```

---

### Issue: Location Not Updating

**Symptoms:**
- Location stuck at one point
- Map doesn't move
- Same coordinates showing

**Solutions:**

1. **Check Active Incident**
   ```
   Location only updates during active incident
   Create emergency first
   ```

2. **Wait for Update Cycle**
   ```
   Updates happen every 5 seconds
   Be patient, watch for changes
   ```

3. **Move Physically**
   ```
   If testing with real GPS, walk/drive
   Sitting still = same coordinates
   ```

4. **Browser Permissions**
   ```
   Check location permission is still granted
   Some browsers ask each time
   ```

---

## 🔄 Real-time Sync Issues

### Issue: Dashboards Not Syncing

**Symptoms:**
- Created incident not showing on hospital/traffic
- Location updates not appearing
- Old data displayed

**Solutions:**

1. **Wait 5 Seconds**
   ```
   Auto-refresh happens every 5 seconds
   Count to 5 and watch for update
   ```

2. **Manual Refresh**
   ```
   Press F5 or Ctrl+R
   Should show latest data immediately
   ```

3. **Check All Logged In**
   ```
   Each dashboard must be logged in
   Verify token not expired
   ```

4. **Verify Same Server**
   ```
   All tabs should be on same domain
   Don't mix localhost with deployed version
   ```

5. **Check Console for Errors**
   ```
   F12 → Console
   Look for API errors (red messages)
   ```

---

### Issue: Data Appears Then Disappears

**Symptoms:**
- Incident shows briefly then vanishes
- Flickering data

**Solutions:**

1. **Check Incident Status**
   ```
   Completed incidents removed from active list
   Check if someone marked it complete
   ```

2. **Multiple Users on Same Account**
   ```
   Don't login with same credentials in multiple places
   Create separate accounts for testing
   ```

3. **Auto-Refresh Glitch**
   ```
   Refresh page manually (F5)
   Should stabilize
   ```

---

## 🚑 Ambulance Dashboard Issues

### Issue: Can't Submit Emergency

**Error: "Failed to create incident"**

**Solutions:**

1. **Fill All Required Fields**
   ```
   ✓ Severity: Must select one
   ✓ Hospital: Must select one
   Location: Auto-detected (don't worry about this)
   Patient Info: Optional
   ```

2. **Check Hospital List Loaded**
   ```
   If dropdown is empty:
   - Refresh page
   - Check internet connection
   - Check console for errors
   ```

3. **Verify Login**
   ```
   Must be logged in as "ambulance" role
   Check header shows your name
   ```

4. **Network Error**
   ```
   Check internet connection
   Try again after 30 seconds
   ```

---

### Issue: Can't Complete Incident

**Button doesn't work or error appears**

**Solutions:**

1. **Ensure Incident is Active**
   ```
   Only active incidents can be completed
   Already completed incidents can't be re-completed
   ```

2. **Refresh and Try Again**
   ```
   F5 to refresh
   Click "Mark as Completed" again
   ```

3. **Check Authorization**
   ```
   Only the ambulance that created incident can complete it
   (Current limitation - any ambulance can complete any incident)
   ```

---

## 🏥 Hospital Dashboard Issues

### Issue: No Incoming Ambulances

**Empty list displayed**

**Solutions:**

1. **Create Test Incident**
   ```
   Open new tab → Login as ambulance
   Create emergency incident
   Return to hospital tab
   Wait 5 seconds for refresh
   ```

2. **Check Active Incidents**
   ```
   Only "active" incidents show
   Completed incidents removed automatically
   ```

3. **Verify Auto-Refresh**
   ```
   Wait 5 seconds
   Should see data if incidents exist
   ```

---

### Issue: Can't See Incident Details

**Clicking incident doesn't show details**

**Solutions:**

1. **Click Inside the Card**
   ```
   Click anywhere inside the incident card
   Should highlight with blue/green border
   ```

2. **Refresh Page**
   ```
   F5 to reload
   Try clicking again
   ```

3. **Check Checklist Below**
   ```
   Details appear in separate card below the list
   Scroll down to see it
   ```

---

## 👮 Traffic Police Dashboard Issues

### Issue: Can't See Route

**Map shows ambulance but no route line**

**Solutions:**

1. **Select an Incident**
   ```
   Click on any incident in the list
   Route only shows for selected incident
   ```

2. **Ensure Hospital Data Loaded**
   ```
   Route needs hospital location
   Wait for full data load
   Refresh if needed
   ```

3. **Check Map Zoom**
   ```
   Route might be out of view
   Zoom out to see entire route
   Map should auto-fit bounds
   ```

---

## 🌐 Network & API Issues

### Issue: API Errors in Console

**Red errors mentioning "fetch" or "API"**

**Solutions:**

1. **Check Supabase Connection**
   ```
   Verify Supabase is connected
   Backend should be running
   ```

2. **Check Network Tab**
   ```
   F12 → Network tab
   Look for failed requests (red)
   Check status codes (should be 200)
   ```

3. **Authentication Token Expired**
   ```
   Logout and login again
   Token refreshes on new login
   ```

4. **Server Error (500)**
   ```
   Backend issue
   Check backend logs
   Wait a minute and try again
   ```

---

## 🎨 UI/Display Issues

### Issue: Styling Looks Broken

**Symptoms:**
- No colors
- Weird layout
- Buttons look plain

**Solutions:**

1. **Clear Cache**
   ```
   Ctrl+Shift+Delete
   Clear cached CSS files
   ```

2. **Hard Refresh**
   ```
   Ctrl+Shift+R
   Forces reload of all styles
   ```

3. **Check Browser Compatibility**
   ```
   Use modern browser:
   - Chrome 90+
   - Firefox 88+
   - Safari 14+
   - Edge 90+
   ```

---

### Issue: Text Overlapping or Cut Off

**Symptoms:**
- Text runs outside boxes
- Labels overlapping content

**Solutions:**

1. **Zoom Level**
   ```
   Browser zoom should be 100%
   Ctrl+0 to reset zoom
   ```

2. **Window Size**
   ```
   Resize browser window
   Try full screen (F11)
   ```

3. **Different Screen Resolution**
   ```
   Designed for 1920x1080+
   Works on mobile but smaller screen = smaller text
   ```

---

## 📱 Mobile Issues

### Issue: Map Not Interactive on Mobile

**Can't zoom or pan map**

**Solutions:**

1. **Use Two Fingers**
   ```
   Pinch to zoom
   Two-finger drag to pan
   ```

2. **Enable Touch**
   ```
   Map should auto-detect touch
   If not working, refresh page
   ```

3. **Switch to Desktop View**
   ```
   For demo purposes, desktop view recommended
   Better for presentations
   ```

---

### Issue: Form Too Small on Mobile

**Hard to tap buttons or fill forms**

**Solutions:**

1. **Rotate to Landscape**
   ```
   Turn phone sideways
   More horizontal space
   ```

2. **Zoom In**
   ```
   Pinch to zoom on form
   ```

3. **Use Desktop for Demo**
   ```
   Mobile works but desktop is better for hackathon presentations
   ```

---

## 🔄 Performance Issues

### Issue: Slow Loading

**App takes long time to load**

**Solutions:**

1. **Check Internet Speed**
   ```
   Run speed test
   Need at least 1 Mbps
   ```

2. **Close Other Tabs**
   ```
   Free up browser memory
   Close unused tabs/apps
   ```

3. **Clear Cache**
   ```
   Ctrl+Shift+Delete
   Clear cached data
   ```

4. **Use Incognito/Private Mode**
   ```
   Clean slate, no extensions
   Faster loading
   ```

---

### Issue: High CPU/Memory Usage

**Browser slowing down, fans spinning**

**Solutions:**

1. **Close Unused Tabs**
   ```
   Only keep necessary dashboards open
   ```

2. **Stop Auto-Refresh**
   ```
   Known limitation: 5-second polling
   For long demos, refresh manually instead
   ```

3. **Reduce Open Dashboards**
   ```
   Only open dashboard when needed
   Don't keep all 3 open for hours
   ```

---

## 🐛 Known Limitations

### These are EXPECTED behaviors (not bugs):

1. **5-Second Delay**
   ```
   Updates happen every 5 seconds
   Not instant - this is by design (polling)
   ```

2. **GPS Inaccuracy**
   ```
   Browser GPS can be 10-50m off
   This is normal for browser-based location
   ```

3. **Straight-Line Routes**
   ```
   Routes are straight lines, not following roads
   Real routing would need Google Maps API (paid)
   ```

4. **No Push Notifications**
   ```
   Must have browser open to receive updates
   Push notifications not implemented yet
   ```

5. **No Offline Mode**
   ```
   Requires internet connection
   Won't work offline
   ```

---

## 🆘 Emergency Fixes During Demo

### If something breaks during your presentation:

### Plan A: Refresh Everything
```
1. F5 on all tabs
2. Wait 10 seconds
3. Try again
```

### Plan B: Re-login
```
1. Logout all tabs
2. Login again
3. Restart demo from beginning
```

### Plan C: New Browser
```
1. Open Chrome/Firefox
2. Go to application URL
3. Login and continue
```

### Plan D: Explain the Concept
```
1. Close broken demo
2. Show code instead
3. Explain architecture
4. Use diagrams from ARCHITECTURE.md
5. Describe what SHOULD happen
```

---

## 📞 Pre-Demo Testing Checklist

Test these 30 minutes before your presentation:

- [ ] Can access login page
- [ ] Can sign up new accounts (all 3 roles)
- [ ] Can login with each role
- [ ] Ambulance can create incident
- [ ] Hospital sees incoming alert
- [ ] Traffic sees active emergency
- [ ] Map loads on all dashboards
- [ ] Markers appear on map
- [ ] Route displays correctly
- [ ] Location updates work
- [ ] Auto-refresh working (wait 5-10 seconds)
- [ ] Can complete incident
- [ ] All three dashboards update together

If ALL of the above work, you're ready! 🚀

---

## 💡 Pro Tips

### For Smooth Demo:

1. **Pre-create accounts** before presentation
2. **Keep them logged in** during demo
3. **Test once** 15 minutes before
4. **Have backup browser** ready
5. **Close unnecessary tabs**
6. **Disable notifications**
7. **Use stable WiFi** (not mobile hotspot)
8. **Have water** nearby (you'll talk a lot!)

### If Judges Ask "What if X breaks?":

> "Great question! In production, we'd have:
> - Error monitoring (Sentry)
> - Fallback systems
> - Redundant servers
> - 24/7 support
> - Offline mode
> - But for this demo, we focused on core functionality"

---

## 🎯 Quick Reference

### Common Console Commands

```javascript
// Check if logged in
localStorage.getItem('user')

// Check auth token
localStorage.getItem('access_token')

// Clear everything (logout)
localStorage.clear()

// Check current page
window.location.pathname

// Reload page
location.reload()
```

### Common Browser Shortcuts

```
F5              - Refresh
Ctrl+Shift+R    - Hard refresh
F12             - Open console
Ctrl+Shift+I    - Open DevTools
Ctrl+Shift+Delete - Clear cache
F11             - Fullscreen
```

---

## 📧 Still Having Issues?

### Debug Checklist:

1. **What were you trying to do?**
2. **What happened instead?**
3. **Any error messages?** (check console)
4. **Which dashboard?** (Ambulance/Hospital/Traffic)
5. **Which browser?** (Chrome/Firefox/Safari)
6. **Internet working?** (check other websites)

### Check These Places:

1. **Browser Console** (F12) - Red errors
2. **Network Tab** (F12 → Network) - Failed requests
3. **Application Tab** (F12 → Application → Local Storage) - Saved data

---

**Remember: Deep breath, you got this! 😊**

Most issues are solved by:
1. Refresh (F5)
2. Clear cache
3. Logout + Login again
4. Different browser

**Good luck with your demo! 🚀**
