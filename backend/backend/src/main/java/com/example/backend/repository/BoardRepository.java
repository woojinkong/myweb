package com.example.backend.repository;

import com.example.backend.entity.Board;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BoardRepository extends JpaRepository<Board, Long> {


    List<Board> findByTitleContainingIgnoreCase(String title);
    List<Board> findByContentContainingIgnoreCase(String content);
    List<Board> findByUserIdContainingIgnoreCase(String userId);
    @Query("""
    SELECT DISTINCT b 
    FROM Board b 
    LEFT JOIN FETCH b.images 
    WHERE b.boardGroup.id = :groupId 
    ORDER BY b.createdDate DESC
    """)
    List<Board> findByBoardGroupIdOrderByCreatedDateDesc(Long groupId);


    @Query("""
    SELECT DISTINCT b
    FROM Board b
    LEFT JOIN FETCH b.images
    WHERE b.boardGroup.id = :groupId
    ORDER BY b.pinned DESC, b.createdDate DESC
    """)
    List<Board> findByBoardGroupIdOrderByPinned(Long groupId);

    @Query("""
    SELECT b
    FROM Board b
    WHERE b.boardGroup.id = :groupId
    ORDER BY b.pinned DESC, b.createdDate DESC
    """)
    Page<Board> findPagedBoards(@Param("groupId") Long groupId, Pageable pageable);

    // 🔥 pinned = true 전부 조회
    List<Board> findByBoardGroupIdAndPinnedTrueOrderByCreatedDateDesc(Long groupId);

    // 🔥 pinned = false 페이징
    Page<Board> findByBoardGroupIdAndPinnedFalse(Long groupId, Pageable pageable);


    @Query("SELECT COUNT(b) FROM Board b WHERE b.boardGroup.id = :groupId")
    int countByGroupId(Long groupId);

    List<Board> findByPlainContentContainingIgnoreCase(String keyword);

    // ===========================================
    // ⭐ 여기 추가 (페이징 지원)
    // ===========================================
    Page<Board> findByBoardGroupId(Long groupId, Pageable pageable);
    // ===========================================
    // ⭐ 검색 페이징 버전 추가
    // ===========================================
        Page<Board> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);

        Page<Board> findByPlainContentContainingIgnoreCase(String keyword, Pageable pageable);

        Page<Board> findByUserIdContainingIgnoreCase(String keyword, Pageable pageable);

    @Query("SELECT b.createdDate FROM Board b WHERE b.userId = :userId ORDER BY b.createdDate DESC")
    List<LocalDateTime> findRecentPostTimes(@Param("userId") String userId, Pageable pageable);

    @Query("""
    SELECT b FROM Board b
    JOIN User u ON b.userId = u.userId
    WHERE LOWER(u.nickName) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
    Page<Board> findByUserNickNameContainingIgnoreCase(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT COUNT(b) > 0 FROM Board b WHERE b.boardGroup.id = :groupId AND b.createdDate >= :todayStart")
    boolean existsNewBoardsToday(@Param("groupId") Long groupId, @Param("todayStart") LocalDateTime todayStart);


    @Query("""
       SELECT b FROM Board b
       WHERE b.boardGroup.adminOnly = false
       AND b.boardGroup.sheetEnabled = false
       AND b.boardGroup.passwordEnabled = false
       AND b.boardGroup.type = 'BOARD'
     """)
    List<Board> findPublicBoardsForSitemap();




    //검색수정

    @Query("""
        SELECT b
        FROM Board b
        WHERE b.boardGroup.passwordEnabled = false
        AND LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
        """)
        Page<Board> searchPublicByTitle(
            @Param("keyword") String keyword,
            Pageable pageable
        );

    @Query("""
        SELECT b
        FROM Board b
        WHERE b.boardGroup.passwordEnabled = false
        AND LOWER(b.plainContent) LIKE LOWER(CONCAT('%', :keyword, '%'))
        """)
        Page<Board> searchPublicByContent(
            @Param("keyword") String keyword,
            Pageable pageable
        );

    @Query("""
        SELECT b
        FROM Board b
        WHERE b.boardGroup.passwordEnabled = false
        AND LOWER(b.userId) LIKE LOWER(CONCAT('%', :keyword, '%'))
        """)
        Page<Board> searchPublicByUserId(
            @Param("keyword") String keyword,
            Pageable pageable
        );

    
    @Query("""
        SELECT b FROM Board b
        JOIN User u ON b.userId = u.userId
        WHERE b.boardGroup.passwordEnabled = false
        AND LOWER(u.nickName) LIKE LOWER(CONCAT('%', :keyword, '%'))
        """)
        Page<Board> searchPublicByUserNickName(
            @Param("keyword") String keyword,
            Pageable pageable
        );


    //관리자는 모두검색되게끔 하기 아직 기능 미구현
    
    @Query("""
    SELECT b
    FROM Board b
    WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
    Page<Board> searchAllByTitle(
        @Param("keyword") String keyword,
        Pageable pageable
    );

    @Query("""
    SELECT b
    FROM Board b
    WHERE LOWER(b.plainContent) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
    Page<Board> searchAllByContent(
        @Param("keyword") String keyword,
        Pageable pageable
    );


    @Query("""
    SELECT b FROM Board b
    JOIN User u ON b.userId = u.userId
    WHERE LOWER(u.nickName) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
    Page<Board> searchAllByUserNickName(
        @Param("keyword") String keyword,
        Pageable pageable
    );









}
