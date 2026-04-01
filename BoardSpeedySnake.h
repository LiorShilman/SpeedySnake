// BoardSpeedySnake.h : main header file for the BOARDSPEEDYSNAKE application
//

#if !defined(AFX_BOARDSPEEDYSNAKE_H__77E76845_0EB5_11D3_AE58_CA784773621A__INCLUDED_)
#define AFX_BOARDSPEEDYSNAKE_H__77E76845_0EB5_11D3_AE58_CA784773621A__INCLUDED_

#if _MSC_VER > 1000
#pragma once
#endif // _MSC_VER > 1000

#ifndef __AFXWIN_H__
	#error include 'stdafx.h' before including this file for PCH
#endif

#ifndef LIMIT
#define LIMIT
	#define WIDTHSCREEN   330
	#define HEIGHTSCREEN  286 
	#define WIDTHBOARD    32  
	#define HEIGHTBOARD   22  

#endif

#define TIMER_IN_GAME 1000

#define OFFSET 10

#define UP    8
#define DOWN  2
#define RIGHT 6
#define LEFT  4
#define WALL  1
#define BLANK 0
#define FIRE  5
#define DUVDEVAN 9


#define SPEED_1 350
#define SPEED_2 300
#define SPEED_3 250
#define SPEED_4 200
#define SPEED_5 140
#define SPEED_6 40

#define MAXLINE 80

#include "resource.h"       // main symbols
#include "VBoardGameCofiguration.h"



/////////////////////////////////////////////////////////////////////////////
// CBoardSpeedySnakeApp:
// See BoardSpeedySnake.cpp for the implementation of this class
//

class CBoardSpeedySnakeApp : public CWinApp
{
public:
	CBoardSpeedySnakeApp();
// Overrides
	// ClassWizard generated virtual function overrides
	//{{AFX_VIRTUAL(CBoardSpeedySnakeApp)
	public:
	virtual BOOL InitInstance();
	//}}AFX_VIRTUAL

// Implementation
	//{{AFX_MSG(CBoardSpeedySnakeApp)
	afx_msg void OnAppAbout();
	afx_msg void OnFileNew();
	//}}AFX_MSG
	DECLARE_MESSAGE_MAP()
};


/////////////////////////////////////////////////////////////////////////////

//{{AFX_INSERT_LOCATION}}
// Microsoft Visual C++ will insert additional declarations immediately before the previous line.

#endif // !defined(AFX_BOARDSPEEDYSNAKE_H__77E76845_0EB5_11D3_AE58_CA784773621A__INCLUDED_)
