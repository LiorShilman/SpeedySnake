#if !defined(AFX_SPEEDYSNAKEHIGHSCORE_H__084D1023_1400_11D3_B279_006097210C55__INCLUDED_)
#define AFX_SPEEDYSNAKEHIGHSCORE_H__084D1023_1400_11D3_B279_006097210C55__INCLUDED_

#if _MSC_VER > 1000
#pragma once
#endif // _MSC_VER > 1000
// SpeedySnakeHighScore.h : header file
//

/////////////////////////////////////////////////////////////////////////////
// SpeedySnakeHighScore dialog

class SpeedySnakeHighScore : public CDialog
{
// Construction
public:
	SpeedySnakeHighScore(CWnd* pParent = NULL);   // standard constructor

// Dialog Data
	//{{AFX_DATA(SpeedySnakeHighScore)
	enum { IDD = IDD_HIGH_SCORE };
	CString	m_strLavel1;
	CString	m_strLavel2;
	CString	m_strLavel3;
	CString	m_strName1;
	CString	m_strName2;
	CString	m_strName3;
	CString	m_strRama1;
	CString	m_strRama2;
	CString	m_strRama3;
	CString	m_strScore1;
	CString	m_strScore2;
	CString	m_strScore3;
	CString	m_strSpeed1;
	CString	m_strSpeed2;
	CString	m_strSpeed3;
	//}}AFX_DATA


// Overrides
	// ClassWizard generated virtual function overrides
	//{{AFX_VIRTUAL(SpeedySnakeHighScore)
	protected:
	virtual void DoDataExchange(CDataExchange* pDX);    // DDX/DDV support
	//}}AFX_VIRTUAL

// Implementation
protected:

	// Generated message map functions
	//{{AFX_MSG(SpeedySnakeHighScore)
	virtual BOOL OnInitDialog();
	//}}AFX_MSG
	DECLARE_MESSAGE_MAP()
};

//{{AFX_INSERT_LOCATION}}
// Microsoft Visual C++ will insert additional declarations immediately before the previous line.

#endif // !defined(AFX_SPEEDYSNAKEHIGHSCORE_H__084D1023_1400_11D3_B279_006097210C55__INCLUDED_)
