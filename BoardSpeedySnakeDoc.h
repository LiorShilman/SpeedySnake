// BoardSpeedySnakeDoc.h : interface of the CBoardSpeedySnakeDoc class
//
/////////////////////////////////////////////////////////////////////////////

#if !defined(AFX_BOARDSPEEDYSNAKEDOC_H__77E7684B_0EB5_11D3_AE58_CA784773621A__INCLUDED_)
#define AFX_BOARDSPEEDYSNAKEDOC_H__77E7684B_0EB5_11D3_AE58_CA784773621A__INCLUDED_

#if _MSC_VER > 1000
#pragma once
#endif // _MSC_VER > 1000

#include "BoardSpeedySnake.h"
#include "DirectSound.h"

// DEFINE
#define   MAX_PAUSE			10000000


struct ThreeCPoint
{
	CPoint Last;
	CPoint Curr;
	CPoint Next;
};

struct DirectionInGame
{
	CPoint	m_UP       ;
	CPoint	m_DOWN     ;
	CPoint	m_LEFT     ;
	CPoint	m_RIGHT    ;
	CPoint	m_DUVDEVAN ;
	CPoint	m_WALL     ;
	CPoint	m_BLANK    ;
	CPoint  m_FIRE     ;
};

struct GameHicon
{
	HICON   m_HDuvdevan ;
	HICON   m_HFire  ;
	HICON   m_HWall  ;
	HICON   m_HSnake ;
	HICON   m_HheadUp ;
	HICON   m_HheadRight ;
	HICON   m_HheadLeft ;
	HICON   m_HheadDown ;
	HICON   m_HBlank ;
};

struct ItemInGame
{
	POINT   m_pDuvdevan     ;
	POINT   m_pWall      ;
	POINT   m_pSnake     ;
	POINT   m_pBlank     ;
	POINT   m_pSnakeHead ;
	POINT   m_pFire      ;
};

class CBoardSpeedySnakeDoc : public CDocument
{
protected: // create from serialization only
	CBoardSpeedySnakeDoc();
	DECLARE_DYNCREATE(CBoardSpeedySnakeDoc)

// Attributes
public:

// Operations
public:

// Overrides
	// ClassWizard generated virtual function overrides
	//{{AFX_VIRTUAL(CBoardSpeedySnakeDoc)
	public:
	virtual BOOL OnNewDocument();
	virtual void Serialize(CArchive& ar);
	//}}AFX_VIRTUAL

// Implementation
public:
	BOOL ValidateWallPlace(int Y,int X);
	void SetFireOnStatusBar();
	void SaveInRegister();
	BOOL InPause;
	RECT Rect;
	void FireNow(int Direct);
	void Fire();
	void RandomFire();
	void RandomDuvdevan();
	void RandomWall();

	int  m_nLavel;
	int  m_nSpeed;
	int  m_nScore;
	int  m_nRama;
	int  m_nNumberDuvdevanToFire;
	int	 m_nMaxDuvdevanInLavel;
	int	 m_nScoreForOneDuvdevan;
	int  m_nNumberDuvdevan;

	BOOL NewLavel;
	BOOL EatDuvdevan;
	BOOL EatFire;
	BOOL ThereIsFire;

	HICON   IconStatusBar;

	CPoint			m_nGameBoard[HEIGHTBOARD][WIDTHBOARD];	// stores
	CPoint			m_nDirection;

	ThreeCPoint		m_stHeadPosition ;  // snake's head.
	ThreeCPoint		m_stTailPosition ;  // snake's tail.
	ThreeCPoint		m_stDuvdevanPosition;  // Pizza Cord.

    DirectionInGame m_stDirectGame;
	GameHicon       m_stHiconInGame;
    ItemInGame      m_stItemInGame;
	
	virtual ~CBoardSpeedySnakeDoc();
#ifdef _DEBUG
	virtual void AssertValid() const;
	virtual void Dump(CDumpContext& dc) const;
#endif

protected:

// Generated message map functions
protected:
	//{{AFX_MSG(CBoardSpeedySnakeDoc)
		// NOTE - the ClassWizard will add and remove member functions here.
		//    DO NOT EDIT what you see in these blocks of generated code !
	//}}AFX_MSG
	DECLARE_MESSAGE_MAP()
};

/////////////////////////////////////////////////////////////////////////////

//{{AFX_INSERT_LOCATION}}
// Microsoft Visual C++ will insert additional declarations immediately before the previous line.

#endif // !defined(AFX_BOARDSPEEDYSNAKEDOC_H__77E7684B_0EB5_11D3_AE58_CA784773621A__INCLUDED_)
